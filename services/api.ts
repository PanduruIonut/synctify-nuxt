const refreshToken = async () => {
  const runtimeConfig = useRuntimeConfig();
  const cookies = useCookie('storeId');
  const refresh_token = cookies.value.user.refreshToken;
  const user_id = cookies.value.user.id 
  const client_secret = cookies.value.user.settings.clientId 
  const client_id = cookies.value.user.settings.clientSecret 
    const response = await fetch(`${runtimeConfig.public.API_BASE_URL}/refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({refresh_token, user_id, client_id, client_secret}),
    });
  
    if (response.status === 200) {
      const data = await response.json();
      const newAccessToken = data.new_access_token;
      console.log(newAccessToken)
      cookies.value.user.accessToken = newAccessToken
      return newAccessToken;
    }
  
    throw new Error('Failed to refresh token');
  };
  
  const handleFetch = async (url:string, options = {}, attempts = 1) => {
    try {
      let response = await fetch(url, options);
      if (response.status === 401) {
        if (attempts < 2) {
          const newAccessToken = await refreshToken();
          options.headers.Authorization = `Bearer ${newAccessToken}`;
          return handleFetch(url, options, attempts + 1);
        }
        throw new Error('Token refresh failed after 2 attempts');
      }
  
      return response;
    } catch (error) {
      throw error;
    }
  };
  
  export default handleFetch;