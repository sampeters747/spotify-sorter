const params = new URLSearchParams(window.location.search);
let accessCode = params.get('code');
let errorMsg = params.get('error');
