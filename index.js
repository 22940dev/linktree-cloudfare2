
const WORKER_URL = 'https://my-worker.armanvaziri.workers.dev';
const STATIC_HTML = 'https://static-links-page.signalnerve.workers.dev';
const PROFILE_PICTURE_LINK = 'https://avatars3.githubusercontent.com/u/46859622?s=400&u=3d7d63928910b4b644b06668a77b98ecc8c4190c&v=4';
const PROFILE_NAME = 'Arman Vaziri';
const BACKGROUND_COLOR = 'linear-gradient(to bottom, #999999 0%, #ffffff 111%)';
const LINKS = [
  {'name': 'Linkedin', 'url': 'https://www.linkedin.com/in/arman-vaziri/'},
  {'name': 'Github', 'url': 'https://github.com/armanvaziri'},
  {'name': 'iOS Development Course', 'url': 'https://iosdev.berkeley.edu'},
  {'name': 'Resume', 'url': 'https://drive.google.com/file/d/1KVXqjmZiCCLfZlt0UzU2k9v3VmwtA7dQ/view?usp=sharing'}];
const SOCIAL_LINKS = [
  {'name': 'Email', 'url': 'mailto:armanvaziri123@berkeley.edu', 'svg': 'https://simpleicons.org/icons/gmail.svg'},
  {'name': 'Phone', 'url': 'tel:5308487549', 'svg': 'https://www.flaticon.com/svg/static/icons/svg/0/488.svg'},
  {'name': 'Messenger', 'url': 'https://www.messenger.com/t/arman.vaziri.9', 'svg': 'https://simpleicons.org/icons/messenger.svg'}];


  /**
   * @param {String} attribute
   * @param {String} change
   * @param {String} content
   * Transforms the specified element with @param content 
   * according to the specified @param attribute and @param change.
   */
class ElementTransformer { 
  constructor(attribute, change, content) {
    this.attribute = attribute;
    this.change = change;
    this.content = content;
  }

  element(element) {
    if (this.change == 'remove') {
      element.removeAttribute(this.attribute); 
    } else if (this.change == 'set') {
      element.setAttribute(this.attribute, this.content);
    } else if (this.change == 'append') {
      element.append(this.content, {html: true});
    } else if (this.change == 'replaceTitle') {
      element.replace('<title>' + this.content + '</title>', {html: true})
    } else {
      throw new Error('Specified change is currently unsupported.');
    }
  }
}

/**
 * @param {Array} content
 * Adds anchors with hyperlinks for each link object in @param content, 
 * within the specified element.
 */
class LinkTreeTransformer {
  constructor(content) {
    this.content = content
  }

  element(element) {
    var length = this.content.length
    for (var i = 0; i < length; i++) {
      element.append('<a href="' + this.content[i].url + '">' + this.content[i].name + '</a>', 
        {html: true}
      );
    }
  }
}
/**
 * @param {Array} content
 * Adds anchors with hyperlinks and a child image for each social link object in @param content 
 * within the specified element. 
 */
class SocialLinkTransformer {
  constructor(content) {
    this.content = content
  }

  element(element) {
    var length = this.content.length 
    for (var i = 0; i < length; i++) {
      element.append('<a href="' + this.content[i].url + '"><img src=' + this.content[i].svg + '></a>', 
        {html: true}
      );
    }
  }
}


const rewriter = new HTMLRewriter()
  .on('div#links', new LinkTreeTransformer(LINKS))
  .on('div#profile', new ElementTransformer('style', 'remove', null))
  .on('img#avatar', new ElementTransformer('src', 'set', PROFILE_PICTURE_LINK))
  .on('h1#name', new ElementTransformer('class', 'set', 'text-md text-black mt-2 font-semibold'))
  .on('h1#name', new ElementTransformer(null, 'append', PROFILE_NAME))
  .on('div#social', new ElementTransformer('style', 'remove', null))
  .on('title', new ElementTransformer(null, 'replaceTitle', PROFILE_NAME))
  .on('body', new ElementTransformer('class', 'remove', null))
  .on('body', new ElementTransformer('style', 'set', 'background:' + BACKGROUND_COLOR))
  .on('div#social', new SocialLinkTransformer(SOCIAL_LINKS)) 


addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})


/**
 * @param {Request} request
 */
async function handleRequest(request) {

  if (request.url == WORKER_URL + '/links') {
    return new Response(JSON.stringify(LINKS), {
      headers: {'content-type': 'application/json'}
    })
  } else {
    var resp = await fetch(STATIC_HTML)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response
      })

    var htmlTransformed = rewriter.transform(resp);
    
    return new Response(htmlTransformed.body, {
      headers: {'content-type': 'text/html'}
    })
    
  }

}
