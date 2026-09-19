let loaderCallback = null;
let activeRequestsCount = 0;

export const registerLoaderCallback = (callback) => {
  loaderCallback = callback;
  if (callback && activeRequestsCount > 0) {
    callback(true);
  }
};

export const showLoader = () => {
  activeRequestsCount++;
  if (loaderCallback) {
    loaderCallback(true);
  }
};

export const hideLoader = () => {
  activeRequestsCount = Math.max(0, activeRequestsCount - 1);
  if (activeRequestsCount === 0 && loaderCallback) {
    loaderCallback(false);
  }
};
