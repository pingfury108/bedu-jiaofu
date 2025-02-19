package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/urfave/cli/v2"
)

func setupRouter(debug bool) *gin.Engine {
	if !debug {
		gin.SetMode(gin.ReleaseMode)
		gin.DisableConsoleColor()
	}
	r := gin.Default()

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
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
