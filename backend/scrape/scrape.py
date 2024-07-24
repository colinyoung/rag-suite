# load xml from https://yourblog.example/feed/

import sys
import requests
import xmltodict
import json
import jq
import pdb
from bs4 import BeautifulSoup
import re


def get_posts(url):
    r = requests.get(url)
    return r.text


def parse_posts(xml):
    return xmltodict.parse(xml)


def chunk_content(post, max_length=150):
    chunks = []
    current_chunk = ""
    for line in post.split("\n"):
        if len(current_chunk) + len(line) <= max_length:
            current_chunk += line + "\n"
        else:
            chunks.append(current_chunk)
            current_chunk = line + "\n"
    if len(current_chunk) > 0 and current_chunk != "\n":
        chunks.append(current_chunk)
    return chunks


def main():
    xml = get_posts(sys.argv[1])
    posts = parse_posts(xml)

    items = jq.compile(
        ".rss.channel.item[]").input(posts).all()

    parsed = []
    for item in items:
        title = item['title']
        chunks = chunk_content(item['content:encoded'])
        print('Chunks for', title, len(chunks))
        for chunk in chunks:
            if chunk == '':
                continue
            parsed.append({
                'id': item['guid']['#text'],
                'link': item['link'],
                'title': title,
                'chunk': chunk,
                'content': item['content:encoded']
            })

    with open('scrapes/scraped.json', 'w') as f:
        json.dump(parsed, f, ensure_ascii=False)


if __name__ == "__main__":
    main()
