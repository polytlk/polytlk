
brew install certbot

# Run the cert challenge
> sudo certbot certonly --manual --preferred-challenges dns

# base64 the resulting cert
> sudo base64 -i /etc/letsencrypt/live/<DOMAIN-NAME>/<CERT>
> sudo base64 -i /etc/letsencrypt/live/<DOMAIN-NAME>/<KEY>

# Dev
This certificate expires on 2024-11-30.
These files will be updated when the certificate renews.
