
let isAuthenticated = false;

export function requireAuth(callback) {
  if(isAuthenticated){
    callback();
  } else {
    showModalLogin(() => {
      isAuthenticated = true;
      callback();
    });
  }
}
