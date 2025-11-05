from azure.identity import ClientSecretCredential
from msgraph import GraphServiceClient
import os
from dotenv import load_dotenv

load_dotenv()

credential = ClientSecretCredential(
    tenant_id=os.getenv("TENANT_ID"),
    client_id=os.getenv("CLIENT_ID"),
    client_secret=os.getenv("CLIENT_SECRET")
)

client = GraphServiceClient(credential)

async def find_all_sites():
    try:
        print("🔍 Searching for all SharePoint sites...\n")
        sites = await client.sites.get()
        
        if sites.value:
            print("✅ Found sites:\n")
            for site in sites.value:
                print(f"Site Name: {site.name}")
                print(f"Site ID: {site.id}")
                print(f"URL: {site.web_url}")
                print(f"Copy this: {site.id}\n")
        else:
            print("❌ No sites found")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

import asyncio
asyncio.run(find_all_sites())
