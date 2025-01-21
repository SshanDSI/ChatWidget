from bs4 import BeautifulSoup
import requests
import re
import time

# Step 1: Fetch the webpage content
URL = "https://deukspine.com/treatment-options/deuk-plasma-rhizotomy/benefits-of-si-joint-dpr"
response = requests.get(URL)
if response.status_code != 200:
    print(f"Failed to fetch the page. Status code: {response.status_code}")

# Step 2: Parse the HTML
soup = BeautifulSoup(response.content, "html.parser")

# Step 3: Remove the footer section
footer = soup.find("footer")  # Finds the <footer> tag
if footer:
    footer.decompose()  # Completely removes the footer from the soup object
nav = soup.find("nav")
if nav:
    nav.decompose()

# Step 4: Extract all headings, paragraphs, and list items
tags = soup.find_all(["h1", "h2", "h3", "h4", "h5", "h6", "p", "li","a"])
f= open("DataStore/SI-Joint-DPR.txt","w")

f.write("\n")
f.write("\n")
f.write("\n")
for tag in tags:
    # print(f"{tag.name.upper()}: {tag.get_text(strip=True)}")  # Print tag name (e.g., H1, P) and text
    try:
        
        if tag.name.upper() == "A":
            f.write(f"{tag.get_text(strip=True)} : https://deukspine.com{tag.get("href")}")
        else:
            f.write(tag.get_text(strip=True))
    except Exception as e:
        print(e)
        continue
    f.write("\n")
f.close()
    