# load xml from https://blog.cleanfi.com/

import requests
import xmltodict
import json
import jq
import pdb
from bs4 import BeautifulSoup
import re


def get_posts():
    url = "https://blog.cleanfi.com/feed/"
    r = requests.get(url)
    return r.text


def parse_posts(xml):
    return xmltodict.parse(xml)


def paragraphs(content):
    soup = BeautifulSoup(content, 'html.parser')
    paragraphs = soup.find_all('p')
    filtered_paragraphs = [
        p for p in paragraphs if 'appeared first on' not in p.get_text()]
    filtered_paragraphs = [
        p for p in filtered_paragraphs if len(p.get_text()) >= 10]
    filtered_paragraphs = [
        p for p in filtered_paragraphs if not re.search(r'\w', p.get_text()) is None]
    return [p.get_text() for p in filtered_paragraphs]


def main():
    xml = get_posts()
    posts = parse_posts(xml)

    items = jq.compile(
        ".rss.channel.item[]").input(posts).all()

    parsed = []
    for item in items:
        title = item['title']
        content = paragraphs(item['content:encoded'])
        parsed.append({
            'id': item['guid']['#text'],
            'link': item['link'],
            'title': title,
            'content': content
        })

    with open('scrapes/cleanfi.json', 'w') as f:
        json.dump(parsed, f, ensure_ascii=False)


if __name__ == "__main__":
    main()
