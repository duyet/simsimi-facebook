# simsimi-facebook
Create Facebook bots with natural language understanding based on Simsimi API

## Deploy with Heroku
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Deploy with Docker

```bash
docker run -it --name simsimi_bot \
           -p <your_desired_port>:5000 \
           -e SIMSIMI_KEY="Your Simsimi key" \
           -e FB_PAGE_ACCESS_TOKEN="Facebook Page Access Token" \
           -e FB_VERIFY_TOKEN="Facebook Verify Token" \
           duyetdev/simsimi-facebook
```
