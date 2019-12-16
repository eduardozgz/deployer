# deployer

I just wanted to write a deployer by myself, it's probably that there is better options but this is enough for me

Endopoint to post webhooks: `/`

# Setup
1. Install dependencies with `npm install`
 
2. Copy deploys.json.example to deploys.json and fill the fields with your custom settings and add the path to your own installation script in the `deploy_tasks` array

3. Test that it works with `node index.js`, and remember to add a webhook in your repo's settings 

