package main

import (
	"context"
	"fmt"
	"log"
	"os"

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

func arkOCR(ctx OCRContext) (string, error) {
	apiKey := os.Getenv("ARK_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("ARK_API_KEY not set")
	}

	apiBase := os.Getenv("ARK_API_BASE")
	if apiBase == "" {
		apiBase = "https://ark.cn-beijing.volces.com/api/v3/"
	}

	model_name := os.Getenv("ARK_MODEL")
	if model_name == "" {
		return "", fmt.Errorf("ARK_MODEL not set")
	}

	client := arkruntime.NewClientWithApiKey(
		os.Getenv("ARK_API_KEY"))

	req := model.ChatCompletionRequest{
		Model: model_name,
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

func setupRouter(debug bool) *gin.Engine {
	if !debug {
		gin.SetMode(gin.ReleaseMode)
		gin.DisableConsoleColor()
	}
	r := gin.Default()

	r.POST("/llm/ocr", func(c *gin.Context) {
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
		})

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

	return r
}

func startServer(port string, debug bool) error {
	router := setupRouter(debug)
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
		},
		Action: func(c *cli.Context) error {
			port := c.String("port")
			debug := c.Bool("debug")
			fmt.Printf("服务器正在启动，端口: %s, 调试模式: %v\n", port, debug)
			return startServer(port, debug)
		},
	}

	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}
