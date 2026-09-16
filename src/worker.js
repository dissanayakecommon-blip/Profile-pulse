export default { async fetch(request, env) { const url=new URL(request.url); if(request.method==="OPTIONS") return new Response(null,{headers:cors()}); if(url.pathname==="/") return env.ASSETS.fetch(new Request(new URL("/index.html",request.url),request)); if(url.pathname==="/health") return json({status:"ok"}); if(url.pathname==="/auth/login"){ if(!env.META_APP_ID)return json({error:"META_APP_ID not configured"},500); const redirect=env.REDIRECT_URI||`${url.origin}/auth/callback`; const a=new URL("https://www.instagram.com/oauth/authorize"); a.searchParams.set("client_id",env.META_APP_ID); a.searchParams.set("redirect_uri",redirect); a.searchParams.set("response_type","code"); a.searchParams.set("scope","instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments"); return Response.redirect(a.toString(),302); } if(url.pathname==="/auth/callback"){ const code=url.searchParams.get("code"); const error=url.searchParams.get("error"); if(error)return new Response(`Instagram authorization failed: ${error}`,{status:400}); if(!code)return new Response("No authorization code returned.",{status:400}); if(!env.META_APP_ID||!env.META_APP_SECRET)return new Response("Callback reached. Add META_APP_ID and META_APP_SECRET in Cloudflare next.",{status:500}); return new Response("Instagram authorization code received. Token exchange is the next setup step."); } 
                                            if(url.pathname==="/auth/deauthorize" && request.method==="POST"){
  return json({ok:true,message:"Deauthorization received"});
}
if(url.pathname==="/auth/data-deletion" && request.method==="POST"){
  return json({url:"https://profile-pulse.dissanayakecommon.workers.dev",confirmation_code:"profile-pulse-deletion"});
    }if(url.pathname==="/api/insights"){
  const token = env.INSTAGRAM_ACCESS_TOKEN;
  const instagramId = "17841463531948420";

  const response = await fetch(
    `https://graph.instagram.com/${instagramId}?fields=id,username,followers_count,media_count&access_token=${token}`
  );

  const data = await response.json();

  return json({
    mode:"instagram",
    instagram:data
  });
}

return json({error:"Not found"},404); } }; function cors(){return {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"Content-Type,Authorization"}} function json(d,s=200){return new Response(JSON.stringify(d,null,2),{status:s,headers:{"content-type":"application/json;charset=utf-8",...cors()}})}
