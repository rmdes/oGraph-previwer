import {
  CODE_CONTAINER_ID,
  NO_OG_DATA,
  PREVIEW_CONTAINER_ID,
  PREVIEW_UI,
  PREVIEW_IMG_HEIGHT,
} from "./constants";
import data from "./state";
import { getImageWidth } from "./utils";

const getNoPreviewTemplateString = () => {
  return `<h3 class="no-data">${NO_OG_DATA}</h3>`;
};

const getCodeTemplateString = () => {
  let templateString = "{<br/>";
  for (const [key, value] of Object.entries(data.getData())) {
    templateString += `<span class="key">${key}</span>: <span class="value">${value}</span></br>`;
  }
  templateString += "}";
  return templateString;
};

const getPreviewTemplateString = (
  previewType,
  { title, description, imageSrc, siteName, url }
) => {
  let templateString = "";

  const imageDivDefaultStyle = `height:${PREVIEW_IMG_HEIGHT}px;`;
  const imageContainerComputedStyle =
    previewType === PREVIEW_UI.WITH_IMAGE
      ? `style="${imageDivDefaultStyle}background: url('${imageSrc}') no-repeat top / contain;"`
      : `style="${imageDivDefaultStyle}"`;

  templateString += `
    <div ${imageContainerComputedStyle}></div>
    <h2>${title ?? ""}</h2>
    <p>
     ${description ?? ""}
    </p>
    <h4>${siteName ?? url ?? ""}</h4>
  `;
  return templateString;
};


// Add new function to handle UI changes after Bluesky login
export function updateBlueskyLoginUI(success, handle, pdsUrl) {
  const loggedInMessageElem = document.getElementById("logged-in-message");
  const loginFormElem = document.getElementById("login-form");
  const userInputFormElem = document.getElementById("user-input-form");
  const pdsUrlContainerElem = document.getElementById("pds-url-container");  // New variable
  const logoutBtnElem = document.getElementById("logout-btn"); // New variable

  if (success) {
    // Hide the login form and PDS URL input
    loginFormElem.style.display = "none";
    pdsUrlContainerElem.style.display = "none";  // Updated line
    
    // Show the logged-in message
    loggedInMessageElem.textContent = `Logged in as ${handle} on ${pdsUrl}`;
    loggedInMessageElem.style.display = "block";
    logoutBtnElem.style.display = "block";  // logout
    
    // Show the user input form for creating a post
    userInputFormElem.style.display = "block";
  } else {
    // If login failed, show the login form and hide the logged-in message and user input form
    loginFormElem.style.display = "block";
    logoutBtnElem.style.display = "none";  // logout
    pdsUrlContainerElem.style.display = "block";  // Updated line
    loggedInMessageElem.style.display = "none";
    userInputFormElem.style.display = "none";
  }
}



/*populate datatab UI*/
export function updateDataView() {
  const dataUIContainer = document.getElementById(CODE_CONTAINER_ID);
  if (Object.keys(data.getData()).length) {
    dataUIContainer.innerHTML = getCodeTemplateString();
    return;
  }
  dataUIContainer.innerHTML = "{}";
}

/*populate preview UI with data from chrome script execution*/
export function updatePreview() {
  const previewContainer = document.getElementById(PREVIEW_CONTAINER_ID);
  if (Object.keys(data.getData()).length) {
    const {
      title,
      image: imageSrc,
      description,
      site_name: siteName,
      url,
    } = data.getData();
    let template;
    getImageWidth(imageSrc)
      .then(({ width, height }) => {
        template = getPreviewTemplateString(PREVIEW_UI.WITH_IMAGE, {
          title,
          description,
          imageSrc,
          siteName,
          url,
          imgWidth: width,
          imgHeight: height,
        });
      })
      .catch(() => {
        template = getPreviewTemplateString(PREVIEW_UI.WITHOUT_IMAGE, {
          title,
          description,
          siteName,
          url,
        });
      })
      .finally(() => {
        previewContainer.innerHTML = template;
      });
  } else {
    previewContainer.innerHTML = getNoPreviewTemplateString();
  }
}

export default function populateAllViews() {
  updatePreview();
  updateDataView();
}