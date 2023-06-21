const config = require('../conf/config.json');
const domainWhitelist = config.domainWhitelist;
const cacheDomain = []
/**
 *
 * @param {*} page intercept request for this page and check if request is in whitelist domain
 */
async function pageWithInterceptor(page) {
  console.log("[Interceptor] enable interceptor")
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    const url = new URL(request.url());
    // accept data protocol
    if(url.protocol==="data:"){
      request.continue();
      return;
    }
    // check in cache
    if(cacheDomain.includes(url.hostname)){
      request.continue();
      return;
    }
    // check by domain without regex
    if(domainWhitelist.includes(url.hostname)){
      cacheDomain.push(url.hostname)
      request.continue();
      return;
    }
    // check by domain with wildcard
    const isWhitelisted = domainWhitelist.some(domain => {
      if(domain.startsWith("*.")){
        const domainSuffix = domain.replace("*","");
        return url.hostname.endsWith(domainSuffix);
      }
      return false;
    });
    if (isWhitelisted) {
      cacheDomain.push(url.hostname)
      request.continue();
    } else {
      console.warn("[Interceptor] abort query:", request.url())
      if(config.bypassWhitelist){
        request.continue();
      }else{
        request.abort();
      }
    }
  });
  return page;
}

module.exports = {pageWithInterceptor}