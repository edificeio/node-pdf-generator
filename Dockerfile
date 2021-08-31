FROM node:12.4

RUN apt-get update && apt-get install -y wget --no-install-recommends \
  && apt-get install apt-transport-https ca-certificates \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ $( lsb_release -sc ) stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
  && apt-get purge --auto-remove -y curl \
  && rm -rf /src/*.deb 

RUN set -x \
    && apt-get update && apt-get install -y --no-install-recommends ca-certificates wget && rm -rf /var/lib/apt/lists/* \
    && apt-get purge -y --auto-remove ca-certificates wget

RUN set -x \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
       libreoffice \
    && apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 \
       libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 \
       libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 \
       libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 \
       libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation  \
    && apt-get install -y xlsx2csv  \
    && rm -rf /var/lib/apt/lists/*

ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

WORKDIR /app
COPY . .

RUN npm install
RUN npm install puppeteer
EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD npm run start