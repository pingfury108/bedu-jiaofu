package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/urfave/cli/v2"

	_ "github.com/joho/godotenv/autoload"

	"embed"
	"html/template"

	"github.com/volcengine/volcengine-go-sdk/service/arkruntime"
	"github.com/volcengine/volcengine-go-sdk/service/arkruntime/model"
	"github.com/volcengine/volcengine-go-sdk/volcengine"
)

//go:embed templates/*
var templateFS embed.FS

//go:embed static/*
var staticFS embed.FS

const ocrPrompt = `#Role: 我是一个专门用于从图片中识别内容的专业 AI 角色

## Goals:
- 严格逐字识别图片中可见的文字
- 保持括号内空白
- 保持原有格式和标点

## Constraints:
- 仅输出实际可见的文字
- 括号内若为空白则保持 ( )
- 不进行任何推测或补全
- 不理解或解释内容
- 不添加任何额外标点符号
- 数学表达式使用 LaTeX 格式,用 $ 包裹

## Outputs:
- 纯文本格式
- 保持原有换行
- 不使用 markdown

## Rules:
- 遇到空白处保持原样,不填充
- 遇到不完整的句子保持原样,不补全
- 严格按照原文呈现,包括标点和空格`

type OCRContext struct {
	ImageData string
}

type Config struct {
	Users []string `json:"users"`
}

var (
	allowedTokens     []string
	defaultConfigFile = "config.json"
)

func loadTokensFromFile(configFile string) error {
	if configFile == "" {
		// 使用当前工作目录下的默认配置文件
		workDir, err := os.Getwd()
		if err != nil {
			return fmt.Errorf("获取工作目录失败: %v", err)
		}
		configFile = filepath.Join(workDir, defaultConfigFile)
	}

	// 如果文件不存在，创建并写入空配置
	if _, err := os.Stat(configFile); os.IsNotExist(err) {
		emptyConfig := Config{Users: []string{}}
		data, err := json.Marshal(emptyConfig)
		if err != nil {
			return fmt.Errorf("创建空配置文件失败: %v", err)
		}
		if err := os.WriteFile(configFile, data, 0644); err != nil {
			return fmt.Errorf("写入空配置文件失败: %v", err)
		}
	}

	// 读取并解析配置文件
	data, err := os.ReadFile(configFile)
	if err != nil {
		return fmt.Errorf("读取配置文件失败: %v", err)
	}

	var config Config
	if err := json.Unmarshal(data, &config); err != nil {
		return fmt.Errorf("解析配置文件失败: %v", err)
	}

	allowedTokens = config.Users
	return nil
}

// 添加认证中间件函数
func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		// 对 token 进行 URL 解码
		decodedToken, err := url.QueryUnescape(token)
		if err != nil {
			log.Printf("Token URL 解码失败: %v", err)
			c.JSON(200, gin.H{
				"text": "无效的授权令牌",
			})
			c.Abort()
			return
		}
		log.Printf("Authorization token received: %s", decodedToken)

		// 检查 token 是否在允许列表中
		authorized := false
		for _, allowedToken := range allowedTokens {
			if decodedToken == allowedToken {
				authorized = true
				break
			}
		}

		if !authorized {
			c.JSON(200, gin.H{
				"text": "无权访问",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

func arkOCR(ctx OCRContext, apiKey, apiBase, modelName string) (string, error) {
	if apiKey == "" {
		return "", fmt.Errorf("API key is required")
	}

	if apiBase == "" {
		apiBase = "https://ark.cn-beijing.volces.com/api/v3/"
	}

	if modelName == "" {
		return "", fmt.Errorf("Model name is required")
	}

	client := arkruntime.NewClientWithApiKey(apiKey)

	req := model.ChatCompletionRequest{
		Model: modelName,
		Messages: []*model.ChatCompletionMessage{
			{
				Role: model.ChatMessageRoleSystem,
				Content: &model.ChatCompletionMessageContent{
					StringValue: volcengine.String(ocrPrompt),
				},
			},

			{
				Role: model.ChatMessageRoleUser,
				Content: &model.ChatCompletionMessageContent{
					ListValue: []*model.ChatCompletionMessageContentPart{
						{
							Type: model.ChatCompletionMessageContentPartTypeImageURL,
							ImageURL: &model.ChatMessageImageURL{
								URL: ctx.ImageData,
							},
						},
					},
				},
			},
		},
	}
	chatCompletion, err := client.CreateChatCompletion(context.Background(), req)

	if err != nil {
		return "", fmt.Errorf("failed to create chat completion: %v", err)
	}

	if len(chatCompletion.Choices) == 0 {
		return "", fmt.Errorf("no choices returned from API")
	}

	return *chatCompletion.Choices[0].Message.Content.StringValue, nil
}

func adminAuthMiddleware(adminKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		cookieKey, err := c.Cookie("admin_key")
		if err != nil || cookieKey != adminKey {
			c.Redirect(http.StatusFound, "/auth")
			c.Abort()
			return
		}
		c.Next()
	}
}

func setupRouter(debug bool, apiKey, apiBase, modelName string, adminKey string) *gin.Engine {
	if !debug {
		gin.SetMode(gin.ReleaseMode)
		gin.DisableConsoleColor()
	}
	r := gin.Default()
	r.SetHTMLTemplate(template.Must(template.New("").Funcs(r.FuncMap).ParseFS(templateFS, "templates/*")))

	// Serve static files from embedded FS under "/public" URL path
	subFS, _ := fs.Sub(staticFS, "static")
	r.StaticFS("/public", http.FS(subFS))

	// 添加 CORS 中间件
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, authentication, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	s := r.Group("/s")
	{

		// 添加非认证的OCR路由
		s.POST("/ocr", func(c *gin.Context) {
			var request struct {
				ImageData string `json:"image_data" binding:"required"`
			}

			if err := c.ShouldBindJSON(&request); err != nil {
				c.JSON(400, gin.H{
					"error": "无效请求: " + err.Error(),
				})
				return
			}

			result, err := arkOCR(OCRContext{
				ImageData: request.ImageData,
			}, apiKey, apiBase, modelName)

			if err != nil {
				log.Printf("OCR错误: %v", err)
				c.JSON(500, gin.H{
					"error": "OCR处理过程中发生内部服务器错误",
				})
				return
			}

			c.JSON(200, gin.H{
				"text": result,
			})
		})

		// OCR页面路由
		s.GET("/Zamc6CQ", func(c *gin.Context) {
			c.HTML(http.StatusOK, "ocr.html", nil)
		})

	}

	// 在 /llm 路由组中使用认证中间件
	llmGroup := r.Group("/llm")
	llmGroup.Use(authMiddleware())
	{
		llmGroup.POST("/ocr", func(c *gin.Context) {
			var request struct {
				ImageData string `json:"image_data" binding:"required"`
			}

			if err := c.ShouldBindJSON(&request); err != nil {
				c.JSON(400, gin.H{
					"error": "Invalid request: " + err.Error(),
				})
				return
			}

			result, err := arkOCR(OCRContext{
				ImageData: request.ImageData,
			}, apiKey, apiBase, modelName)

			if err != nil {
				log.Printf("OCR error: %v", err)
				c.JSON(500, gin.H{
					"error": "Internal server error occurred during OCR processing",
				})
				return
			}

			c.JSON(200, gin.H{
				"text": result,
			})
		})

		// 新增测试路由
		llmGroup.GET("/test", func(c *gin.Context) {
			c.JSON(200, gin.H{"error": "ok"})
		})
	}

	// Serve users.html at the root path
	r.GET("/", adminAuthMiddleware(adminKey), func(c *gin.Context) {
		c.HTML(http.StatusOK, "users.html", gin.H{"users": allowedTokens})
	})

	// Add user management endpoints
	userGroup := r.Group("/users")
	userGroup.Use(adminAuthMiddleware(adminKey))
	{
		userGroup.POST("/add", func(c *gin.Context) {
			var request struct {
				Uname string `json:"uname" binding:"required"`
			}

			if err := c.ShouldBindJSON(&request); err != nil {
				c.JSON(400, gin.H{"error": "Invalid request: " + err.Error()})
				return
			}

			// Check if user already exists
			for _, user := range allowedTokens {
				if user == request.Uname {
					c.JSON(400, gin.H{"error": "User already exists"})
					return
				}
			}

			// Add new user
			allowedTokens = append(allowedTokens, request.Uname)

			// Save to config file
			config := Config{Users: allowedTokens}
			data, err := json.Marshal(config)
			if err != nil {
				c.JSON(500, gin.H{"error": "Failed to marshal config"})
				return
			}

			if err := os.WriteFile(defaultConfigFile, data, 0644); err != nil {
				c.JSON(500, gin.H{"error": "Failed to save config"})
				return
			}

			c.JSON(200, gin.H{"message": "User added successfully"})
		})

		userGroup.POST("/remove", func(c *gin.Context) {
			var request struct {
				Uname string `json:"uname" binding:"required"`
			}

			if err := c.ShouldBindJSON(&request); err != nil {
				c.JSON(400, gin.H{"error": "Invalid request: " + err.Error()})
				return
			}

			// Find and remove user
			newUsers := []string{}
			removed := false
			for _, user := range allowedTokens {
				if user != request.Uname {
					newUsers = append(newUsers, user)
				} else {
					removed = true
				}
			}

			if !removed {
				c.JSON(400, gin.H{"error": "User not found"})
				return
			}

			allowedTokens = newUsers

			// Save to config file
			config := Config{Users: allowedTokens}
			data, err := json.Marshal(config)
			if err != nil {
				c.JSON(500, gin.H{"error": "Failed to marshal config"})
				return
			}

			if err := os.WriteFile(defaultConfigFile, data, 0644); err != nil {
				c.JSON(500, gin.H{"error": "Failed to save config"})
				return
			}

			c.JSON(200, gin.H{"message": "User removed successfully"})
		})
	}

	// Add auth endpoints
	r.GET("/auth", func(c *gin.Context) {
		c.HTML(http.StatusOK, "login.html", nil)
	})

	r.POST("/auth", func(c *gin.Context) {
		key := c.PostForm("authKey")
		if key == adminKey {
			c.SetCookie("admin_key", key, 3600, "/", "", false, true)
			c.Redirect(http.StatusFound, "/")
		} else {
			c.HTML(http.StatusOK, "login.html", gin.H{
				"error": "Invalid admin key",
			})
		}
	})

	return r
}

func startServer(port string, debug bool, apiKey, apiBase, modelName string, adminKey string) error {
	router := setupRouter(debug, apiKey, apiBase, modelName, adminKey)
	return router.Run(":" + port)
}

func main() {
	app := &cli.App{
		Name:  "bedu-jiaofu",
		Usage: "启动 API 服务器",
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:    "port",
				Aliases: []string{"p"},
				Value:   "8080",
				Usage:   "服务器端口",
			},
			&cli.BoolFlag{
				Name:  "debug",
				Value: false,
				Usage: "是否启用调试模式",
			},
			&cli.StringFlag{
				Name:    "config",
				Aliases: []string{"c"},
				Value:   "config.json",
				Usage:   "配置文件路径",
			},
			&cli.StringFlag{
				Name:    "api-key",
				Aliases: []string{"k"},
				Value:   "",
				Usage:   "Ark API Key",
				EnvVars: []string{"ARK_API_KEY"},
			},
			&cli.StringFlag{
				Name:    "api-base",
				Aliases: []string{"b"},
				Value:   "https://ark.cn-beijing.volces.com/api/v3/",
				Usage:   "Ark API Base URL",
				EnvVars: []string{"ARK_API_BASE"},
			},
			&cli.StringFlag{
				Name:    "model",
				Aliases: []string{"m"},
				Value:   "",
				Usage:   "Ark Model Name",
				EnvVars: []string{"ARK_MODEL"},
			},
			&cli.StringFlag{
				Name:    "admin-key",
				Aliases: []string{"a"},
				Value:   "",
				Usage:   "Admin key for user management",
				EnvVars: []string{"ADMIN_KEY"},
			},
		},
		Action: func(c *cli.Context) error {
			if err := loadTokensFromFile(c.String("config")); err != nil {
				log.Printf("加载配置文件失败: %v", err)
				return err
			}

			port := c.String("port")
			debug := c.Bool("debug")
			apiKey := c.String("api-key")
			apiBase := c.String("api-base")
			modelName := c.String("model")
			adminKey := c.String("admin-key")

			fmt.Printf("服务器正在启动，端口: %s, 调试模式: %v\n", port, debug)
			return startServer(port, debug, apiKey, apiBase, modelName, adminKey)
		},
	}

	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}
