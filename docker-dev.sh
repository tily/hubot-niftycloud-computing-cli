docker build -f Dockerfile.dev -t tily/hubot-niftycloud-computing-cli:dev .
docker run -ti --rm -v $(pwd):/usr/local/bot --env-file .env tily/hubot-niftycloud-computing-cli:dev bash
