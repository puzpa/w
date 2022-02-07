import discord
import time
import requests
import json


client = discord.Client()


vtToken = 'TOKEN FOR VIRUSTOTAL'
discordToken = 'TOKEN FOR BOT'
url = 'PuzPa'
elapsed = 0.0
keyWord = 'check'


# Gets the time elapsed since last request
def time_since_request():
    return time.time()-elapsed


@client.event
async def on_ready():
    print('登錄為 {0.user}'.format(client))


@client.event
async def on_message(message):
    # 防止機器人從自己的輸出中做任何事情
    if message.author == client.user:
        return

    msg = message.content

    # 檢查用戶是否在前面發送了關鍵字檢查，並且自上次請求以來已超過 15 秒
    if msg.startswith(keyword) and time_since_request() > 15:

        # Validing user input
        urlToScan = msg.split(' ')
        if(len(urlToScan) == 1):  #確保它不為空以防止 IndexOutofBounds
            await message.channel.send("請輸入網址")
        else:
            urlToScan = urlToScan[1]

            # 確保它是一個鏈接
            if(urlToScan[0:4] == "http" and "." in urlToScan):
                # 從用戶中提取 url 進行掃描並向 VirusTotal api 發送請求
                params = {'apikey': vtToken, 'resource': urlToScan}
                response = requests.get(url, params=params)
                response_json = json.loads(response.content)

                # 更新請求時間
                global elapsed
                elapsed = time.time()

                # 檢查它是否已被標記並相應地發送消息

                if response_json['positives'] > 0:
                    await message.channel.send("有危險")
                else:
                    await message.channel.send("連結檢查為安全")
                    await message.channel.send("注意：這不是安全的的！點開來自行負責")

            # 如果用戶輸入了無效鏈接
            else:
                await message.channel.send("請輸入有效網址")
    elif msg.startswith(keyword) and time_since_request() < 15:
        await message.channel.send("請等待 "+str(round(15-time_since_request()))+" 秒 "+" 在檢查另一個 URL 之前")
if __name__=="__main__":
    client.run(OTQwMTc3Nzg2NjMzNTkyODUz.YgDmyw.CQP85SdZv-tCFcTQBeCs4wXyhpg)
