(function(n,l,c,t,h){"use strict";const o={avatarRadius:12,bubbleChatRadius:12,bubbleChatColor:""},C=function(){return{...o,...l.storage}},u=function(e){Object.assign(l.storage,e)};let s=[];const a=function(){const e=C(),{avatarRadius:b,bubbleChatRadius:r,bubbleChatColor:m}=e,d=document.createElement("style");d.id="chat-bubbles-style";const p=m||"var(--background-tertiary)";d.textContent=`
        /* Chat message styling */
        .message_d5deea {
            background-color: ${p};
            border-radius: ${r}px;
            padding: 8px 12px;
            margin: 2px 0;
            max-width: 80%;
        }
        
        /* Avatar styling */
        .avatar_f8541f {
            border-radius: ${b}px !important;
        }
        
        /* Message content adjustments */
        .contents_f9f2ca {
            background: transparent;
        }
        
        /* Message group styling */
        .groupStart_d5deea {
            margin-top: 8px;
        }
    `;const i=document.getElementById("chat-bubbles-style");i&&i.remove(),document.head.appendChild(d)},f=function(){const e=document.getElementById("chat-bubbles-style");e&&e.remove()};var g={onLoad:function(){try{a();const e=c.findByProps("Message","MessageContent");e&&s.push(h.after("type",e,function(b,r){return setTimeout(a,100),r})),t.showToast("ChatBubbles loaded successfully!",t.showToast.Kind.SUCCESS)}catch(e){console.error("Failed to load ChatBubbles:",e),t.showToast("Failed to load ChatBubbles plugin",t.showToast.Kind.FAILURE)}},onUnload:function(){try{s.forEach(function(e){return e()}),s=[],f(),t.showToast("ChatBubbles unloaded",t.showToast.Kind.SUCCESS)}catch(e){console.error("Failed to unload ChatBubbles:",e)}},settings:{avatarRadius:{type:"slider",title:"Avatar Curve",note:"Adjust the border radius of avatars",default:o.avatarRadius,min:0,max:18,step:3,onValueChange:function(e){u({avatarRadius:e}),a()}},bubbleChatRadius:{type:"slider",title:"Bubble Curve",note:"Adjust the border radius of chat bubbles",default:o.bubbleChatRadius,min:0,max:18,step:3,onValueChange:function(e){u({bubbleChatRadius:e}),a()}},bubbleChatColor:{type:"text",title:"Bubble Color",note:"The color of the chat bubble (in #RRGGBBAA format). When empty, default background is used.",default:o.bubbleChatColor,placeholder:"#RRGGBBAA",onValueChange:function(e){e===""||/^#[0-9A-Fa-f]{8}$/.test(e)?(u({bubbleChatColor:e}),a()):t.showToast("Invalid color format! Use #RRGGBBAA",t.showToast.Kind.FAILURE)}}}};return n.default=g,Object.defineProperty(n,"__esModule",{value:!0}),n})({},vendetta.plugin,vendetta.metro,vendetta.ui.toasts,vendetta.patcher);
