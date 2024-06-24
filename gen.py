import requests
import time
import os
import secrets
import random
import threading
from colorama import init, Fore, Style
from pypresence import Presence

class DiscordPromoGenerator:
    def __init__(self):
        self.base_url = 'https://api.discord.gx.games/v1/direct-fulfillment'
        self.filename = 'promos.txt'
        self.retry_delay = 5
        self.locked = 0

    def random_accept_language(self):
        languages = ['en-US,en;q=0.9', 'fr-FR,fr;q=0.9', 'es-ES,es;q=0.9', 'de-DE,de;q=0.9', 'zh-CN,zh;q=0.9']
        return random.choice(languages)

    def random_sec_ch_ua(self):
        browsers = ['"Opera GX";v="105", "Chromium";v="119", "Not?A_Brand";v="24"']
        return random.choice(browsers)

    def random_user_agent(self):
        user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko'
        ]
        return random.choice(user_agents)

    def generate_partner_user_id(self, length=64):
        return secrets.token_hex(length // 2)

    def generate_discord_url(self):
        headers = {
            'authority': 'api.discord.gx.games',
            'accept': '*/*',
            'accept-language': self.random_accept_language(),
            'content-type': 'application/json',
            'origin': 'https://www.opera.com',
            'referer': 'https://www.opera.com/',
            'sec-ch-ua': self.random_sec_ch_ua(),
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'user-agent': self.random_user_agent()
        }
        data = {'partnerUserId': self.generate_partner_user_id()}
        try:
            response = requests.post(self.base_url, headers=headers, json=data)
            response.raise_for_status()
            token = response.json().get('token')
            return f"https://discord.com/billing/partner-promotions/1180231712274387115/{token}"
        except requests.RequestException as e:
            return f"Error: {str(e)}"

    def save_url_to_file(self, url):
        with open(self.filename, 'a') as file:
            file.write(url + "\n")

    def truncate_url(self, url, max_length=120):
        return url if len(url) <= max_length else url[:max_length] + "..."


class DiscordPresenceUpdater:
    def __init__(self):
        self.client_id = "1205602865754677283"
        self.RPC = Presence(self.client_id)
        self.start_time = int(time.time())
        self.RPC.connect()

    def update_presence(self, locked):
        self.RPC.update(
            large_image="hi",
            large_text="Discord Promo gen",
            details=f"Link generated: {locked}",
            start=self.start_time,
            buttons=[{"label": "Buy Now!", "url": "https://nitroseller0.mysellix.io"}]
        )


init(autoreset=True)
promo_generator = DiscordPromoGenerator()
presence_updater = DiscordPresenceUpdater()

choice = input(f"{Fore.MAGENTA}Press 1:{Style.RESET_ALL} to generate an infinite amount of codes.\n{Fore.RED}Press 2:{Style.RESET_ALL} to generate a specific amount.\n{Fore.BLUE}Enter your input{Style.RESET_ALL}: ")

if choice == '1':
    try:
        while True:
            result = promo_generator.generate_discord_url()
            promo_generator.locked += 1
            presence_updater.update_presence(promo_generator.locked)
            if result and not result.startswith("Error"):
                promo_generator.save_url_to_file(result)
                print(f"({Fore.GREEN}+{Style.RESET_ALL}) URL: {promo_generator.truncate_url(result)}")
                promo_generator.retry_delay = 5
            else:
                print(f"({Fore.RED}+{Style.RESET_ALL}) {result} Waiting {promo_generator.retry_delay} seconds before retrying...")
                time.sleep(promo_generator.retry_delay)
                promo_generator.retry_delay += 1
    except KeyboardInterrupt:
        print(f"({Fore.YELLOW}+{Style.RESET_ALL}) Loop stopped by user.")

elif choice == '2':
    num = int(input("Enter the number of codes to generate: "))
    for _ in range(num):
        result = promo_generator.generate_discord_url()
        promo_generator.locked += 1
        if result and not result.startswith("Error"):
            promo_generator.save_url_to_file(result)
            print(f"({Fore.GREEN}+{Style.RESET_ALL}) URL: {promo_generator.truncate_url(result)}")
        else:
            print(f"({Fore.RED}+{Style.RESET_ALL}) {result} Error encountered.")
else:
    print(f"{Fore.RED}Invalid choice. Exiting.{Style.RESET_ALL}")
