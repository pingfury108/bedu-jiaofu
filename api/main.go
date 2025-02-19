package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/urfave/cli/v2"

	_ "github.com/joho/godotenv/autoload"

	"github.com/volcengine/volcengine-go-sdk/service/arkruntime"
	"github.com/volcengine/volcengine-go-sdk/service/arkruntime/model"
	"github.com/volcengine/volcengine-go-sdk/volcengine"
)

const ocrPrompt = `#Role: 我是一个专门用于从图片中识别内容的专业 AI 角色

## Goals: 逐字识别图片中文字, 不输出其他信息

## Constrains:
- 只输出识别的文本
- 不输出其他内容
- 数学表达式使用 Latex 公式, 并使用 $ 将公式前后包裹

## outputs:
- text
- no markdown

## Workflows:
- 识别文本
- 调整符号,使用中文标点符号`

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

		// 检查 token 是否在允许列表中
		authorized := false
		for _, allowedToken := range allowedTokens {
			if token == allowedToken {
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

func setupRouter(debug bool, apiKey, apiBase, modelName string) *gin.Engine {
	if !debug {
		gin.SetMode(gin.ReleaseMode)
		gin.DisableConsoleColor()
	}
	r := gin.Default()

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
	}

	return r
}

func startServer(port string, debug bool, apiKey, apiBase, modelName string) error {
	router := setupRouter(debug, apiKey, apiBase, modelName)
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

			fmt.Printf("服务器正在启动，端口: %s, 调试模式: %v\n", port, debug)
			return startServer(port, debug, apiKey, apiBase, modelName)
		},
	}

	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}
