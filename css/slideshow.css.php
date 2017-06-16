<?php 
header('Content-Type: text/css');
$staticImgCommon = $_GET['static-img-common'];

?>
@charset "utf-8";
html, body {
    min-width: 100%;
    height: initial;
}
html, body, div, span, a, img, h1, h2, h3, h4, h5, h6, p, blockquote, pre {
    border:0; 
    padding:0; 
    margin:0;    
}

.ss-opaque {
    position: fixed;
    top: 0px;
    left: 0px;
    bottom: 0px;
    right: 0px;
    margin: 0 auto 0 auto;
    pointer-events: none;
    
    z-index: 1000;
    display: none;
}    
 
div.ss-wrapper{
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    margin: 0 auto 0 auto;
    bottom:0;
    
    visibility: hidden;
    z-index: 1010;
    align-items: center;
    justify-content: center;
    overflow: auto;
}
div.ss-titlebar{
    z-index: 1010;
    position: relative;
}
div.ss-top{
    z-index: 1020;
    position: relative;
    text-align: center;
    width: 100%;    
}

div.ss-middle{
    z-index: 1030;
    position: relative;
    width: 100%;
    top:0px;
    overflow: hidden;
}

div.ss-large{
    overflow: hidden;
    z-index: 1040;
    top:0;
    position: absolute;
    box-sizing: border-box;
    -moz-box-sizing: border-box;
}

div.ss-large a{
    /* allows for transition of one image on top of another */
    z-index: 1050;
}

div.ss-large img{
    display: block; 
    width: auto; 
    margin-left: auto;
    margin-right: auto;
}

div.ss-large span{
    position:absolute;
    top:0;
    left:0;
    z-index: 1070;
}

div.ss-buttons {
    margin-top: 2px;
    margin-bottom: 2px;
    width: 100%;
}

div.ss-buttons img{
    border:none;
}

/* centers the current slideshow image */
div.ss-title {
    height: 50px;
    min-height: 50px;
    width: 100%;
    line-height: 35px;
    position: absolute;
    bottom:0;
}

div.ss-title-line1, div.ss-title-line2 {
    line-height: 17px;
    padding-top: 3px;
    white-space: nowrap;
}
    
div.ss-title-line1 span{
    color: white;
    overflow: none;
}
.ss-title-line1{
    font-size: 12px !important;
}
.ss-title-line2{
    font-size: 10px !important;
}
.ss-title-line2 span{
    color: white;
}
.ss-title-line2 span a{
    color: lightblue;
    display: inline;
}
.ss-title-line2 span a:hover{
    text-decoration: underline;
}
.ss-center-image{
    position: absolute;
    top: -9999px !important;
    bottom: -9999px;
    left: -9999px !important;
    right: -9999px;
    margin: auto;
}

/* Begin Filmstrip *********/
div.ss-filmstrip {
    position: relative;
    background: #AAA;
    overflow-x: auto;
    overflow-y:hidden;
    width: 100%;
}

div.ss-filmstrip-shoh:after {
    content: '...';
}
div.ss-filmstrip-shoh {
    position: absolute;
    right:20px;
    top:-18px;
    width:16px;
    height:16px;
    margin-top: -1px;
    z-index: 2000;
    font-size:18px;
}

div.ss-shoh{
    border: 0;
    cursor:pointer;
    display:inline-block; 
    color: rgb(111, 149, 115);
}
div.ss-shoh-less {
    /* Less = content: &#9660 ▼ */
}
div.ss-shoh-more {
    /* More = content: &#9658	► */
}

div.ss-content {
    position: relative;
    top: 0px;
    left: 2px;
}

div.ss-filmstrip-content {
    position: relative;
}

div.ss-filmstrip-thumb{
    clear:both; 
    margin:2px 4px; 
    display:inline-block;
    text-align:left;
    overflow:hidden;
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    height: 95px; 
    background: transparent;
}

div.ss-filmstrip-thumb img{
    border-color:#FFF;
    border-style:solid;
    border-width:2px;
    background:#999;
    padding:0px;
    
    margin:0px;
    -webkit-transition:opacity .2s linear; 
    -moz-transition:opacity .2s linear; 
    -o-transition:opacity .2s linear; 
    transition:opacity .2s linear; 		
    /* prevents image shift or distortion */
    -webkit-transform: rotate(0);
    -moz-transform: rotate(0);
    transform: rotate(0);
    -webkit-backface-visibility: hidden;
}

div.ss-filmstrip-thumb a:hover img{
    opacity:.75;
}

div.ss-filmstrip-thumb img.selected {
    border-color:rgb(255,6,6) !important;
}
/* End Filmstrip *********/

/* small buttons */
.ss-buttons > div.buttons-inner-initial {
    top: 0px;
}
.ss-buttons > div, .ss-buttons > div > div {
    display: inline-block;
}

.ss-buttons > div.buttons-outer {
    width: 44px;
    display: inline-block;
    position: relative;
}

.ss-buttons > div.buttons-outer > div.buttons-inner {
    width: 44px;
    display:inline-flex;
    flex-direction:column-reverse;    
    position: absolute;
    z-index: 2000;
    left: 0px;
    line-height: 0;
    height:32px;
    top: -32px;
    overflow:hidden;
}

.ss-buttons > div.buttons-outer > div.buttons-inner-4-buttons:hover {
    height:128px;
    top: -128px;
}
.ss-buttons > div.buttons-outer > div.buttons-inner-3-buttons:hover {
    height:96px;
    top: -96px;
}
.ss-buttons > div.buttons-outer > div.buttons-inner-2-buttons:hover {
    height:64px;
    top: -64px;
}
.ss-buttons > a, .ss-buttons > div.buttons-outer > div.buttons-inner a{
    display: inline-block;
    height: 32px;
    line-height: 0;
}

img.sprite-32:hover{
    background-position:0px -32px;
}

img.sprite-32{
    /*	display:block; */
    display:inline-block;
    width:44px;
    height:32px;
    border:0 !important; 
    padding:0; 
    margin:0 !important;
    z-index:0;
}

img.ss-download{
    background:url(<?php echo $staticImgCommon ?>/slideshow-download-sprite.png) no-repeat 0px 0px scroll;
}
img.ss-download-disabled{
    background:url(<?php echo $staticImgCommon ?>/slideshow-download-sprite.png) no-repeat 0px -64px scroll;
}
img.ss-download-disabled:hover{
    background-position:0px -64px;
}
img.ss-first{
    background:url(<?php echo $staticImgCommon ?>/slideshow-buttons.png) no-repeat 0px 0px scroll;
    width: 31px;
}

img.ss-first:hover{
    background-position: 0px -32px;
}

img.ss-first-disabled{
    background:url(<?php echo $staticImgCommon ?>/slideshow-buttons.png) no-repeat 0px -64px scroll;
    width: 31px;
}

img.ss-first-disabled:hover{
    background-position: 0px -64px;
}

img.ss-prev{
    background:url(<?php echo $staticImgCommon ?>/slideshow-buttons.png) no-repeat -31px 0px scroll;
    width: 31px;
}

img.ss-prev:hover{
    background-position: -31px -32px;
}

img.ss-prev-disabled{
    background:url(<?php echo $staticImgCommon ?>/slideshow-buttons.png) no-repeat -31px -64px scroll;
    width: 31px;
}

img.ss-prev-disabled:hover{
    background-position: -31px -64px;
}

img.ss-pause{
    background:url(<?php echo $staticImgCommon ?>/slideshow-buttons.png) no-repeat -62px 0px scroll;
    width: 31px;
}

img.ss-pause:hover{
    background-position: -62px -32px;
}

img.ss-pause-disabled{
    background:url(<?php echo $staticImgCommon ?>/slideshow-buttons.png) no-repeat -62px -64px scroll;
    width: 31px;
}

img.ss-pause-disabled:hover{
    background-position: -62px -64px;
}

img.ss-next{
    background:url(<?php echo $staticImgCommon ?>/slideshow-buttons.png) no-repeat -93px 0px scroll;
    width: 31px;
}

img.ss-next:hover{
    background-position: -93px -32px;
}

img.ss-next-disabled{
    background:url(<?php echo $staticImgCommon ?>/slideshow-buttons.png) no-repeat -93px -64px scroll;
    width: 31px;
}

img.ss-next-disabled:hover{
    background-position: -93px -64px;
}

img.ss-last{
    background:url(<?php echo $staticImgCommon ?>/slideshow-buttons.png) no-repeat -124px 0px scroll;
    width: 31px;
}

img.ss-last:hover{
    background-position: -124px -32px;
}

img.ss-last-disabled{
    background:url(<?php echo $staticImgCommon ?>/slideshow-buttons.png) no-repeat -124px -64px scroll;
    width: 31px;
}

img.ss-last-disabled:hover{
    background-position: -124px -64px;
}

/* play is 4th tier */
img.ss-play{
    background:url(<?php echo $staticImgCommon ?>/slideshow-buttons.png) no-repeat -62px -96px scroll;
    width: 31px;
}

img.ss-play:hover{
    background-position: -93px -96px;
/*    background-position: -12px -96px; */
}

img.ss-play-disabled{
    background:url(<?php echo $staticImgCommon ?>/slideshow-buttons.png) no-repeat -31px -96px scroll;
    width: 31px;
}

img.ss-play-disabled:hover{
    background-position: -31px -96px;
}

img.ss-print{
    background:url(<?php echo $staticImgCommon ?>/slideshow-print-sprite.png) no-repeat 0px 0px scroll;
}

img.ss-close{
    background:url(<?php echo $staticImgCommon ?>/slideshow-close-sprite.png) no-repeat 0px 0px scroll;
}

img.ss-zoom{
    background:url(<?php echo $staticImgCommon ?>/slideshow-zoom-sprite.png) no-repeat 0px 0px scroll;
}

img.ss-zoom-out{
    background:url(<?php echo $staticImgCommon ?>/slideshow-zoom-out-sprite.png) no-repeat 0px 0px scroll;
}

img.ss-zoom-reset{
    background:url(<?php echo $staticImgCommon ?>/slideshow-zoom-reset-sprite.png) no-repeat 0px 0px scroll;
}

img.ss-full-screen{
    background:url(<?php echo $staticImgCommon ?>/slideshow-full-screen-sprite.png) no-repeat 0px 0px scroll;
}

img.ss-exit-full-screen{
    background:url(<?php echo $staticImgCommon ?>/slideshow-exit-full-screen-sprite.png) no-repeat 0px 0px scroll;
}

img.ss-settings{
    background:url(<?php echo $staticImgCommon ?>/slideshow-settings-sprite.png) no-repeat 0px 0px scroll;
}

img.ss-locate{
    background:url(<?php echo $staticImgCommon ?>/slideshow-locate-sprite.png) no-repeat 0px 0px scroll;
}

img.ss-locate-disabled{
    background:url(<?php echo $staticImgCommon ?>/slideshow-locate-sprite.png) no-repeat 0px -64px scroll;
}

img.ss-locate-disabled:hover{
    background-position:0px -64px;
}

img.ss-feedback{
    background:url(<?php echo $staticImgCommon ?>/slideshow-feedback-sprite.png) no-repeat 0px 0px scroll;
}

img.ss-feedback-disabled{
    background:url(<?php echo $staticImgCommon ?>/slideshow-feedback-sprite.png) no-repeat 0px -64px scroll;
}

img.ss-feedback-disabled:hover{
    background-position:0px -64px;
}

/* LARGE NAVIGATION BUTTONS */
span.ss-buttons-large {
    width: 100%;
}
a.ss-prev-large{
    left: 20px;
}
a.ss-next-large{
    right: 20px;
}
a.ss-next-large, a.ss-prev-large{
    position:absolute;
    top: 100px;
    display: block;
    /* width and height of <a> is larger than image to give more clicking area */
    width: 60px;
    height: 120px;
    z-index: 2000;
}

a.ss-next-large, img.ss-next-large, a.ss-prev-large, img.ss-prev-large{
    border: none;
    opacity:.70;
}

a.ss-close-large{
    position:absolute;
    top: 5px;
    display: block;
    height: 24px;
    width: 24px;
    right: 20px;
    z-index: 2020;
}
img.ss-close-large{
    border: none;
    opacity: .70;
}


/* we need to define dimensions to the id  as there is a conflicting definition */
/* id definitions take precedence, I believe */
img.ss-next-large, img.ss-prev-large{
    width: 30px;
    height: 60px;
}

img.ss-prev-large{
    background:url(<?php echo $staticImgCommon ?>/slideshow-buttons-large.png) no-repeat 0px 0px scroll;
    width: 30px;
    height: 60px;
}

img.ss-prev-large:hover{
    background-position: 0px -60px;
}

img.ss-next-large{
    background:url(<?php echo $staticImgCommon ?>/slideshow-buttons-large.png) no-repeat -30px 0px scroll;
    width: 30px;
    height: 60px;
}

img.ss-next-large:hover{
    background-position: -30px -60px;
}


img.ss-close-large{
    background:url(<?php echo $staticImgCommon ?>/slideshow-close-large.png) no-repeat -0px 0px scroll;
    width: 24px;
    height: 24px;
}

/* horiz then vertical */
img.ss-close-large:hover{
    background-position: 0px -24px;
}

a.ss-next-large:hover img{
     background-position: -30px -60px;   
}


a.ss-prev-large:hover img{
    background-position: 0px -60px;
}

a.ss-next-large:before, a.ss-prev-large:before {
  content: '';
  position: absolute;
  height: 120px;
  width: 60px;
  margin-left: 29px;
}

a.ss-next-large:before {
    right: 29px;
}
/*** End Large Nav Buttons ***/

/*** Magnifier ***/
.ss-magnifier {
    width: 250px;
    height: 250px;
    overflow:hidden;   
    position: absolute;
    z-index: 2000;
    border: solid 2px;
}

.ss-magnifier img {
    position: absolute;    
}
/*** End Magnifier ***/

.hidden {
    display: none !important; 
}

.visibility-hidden {
    visibility: hidden;
}

.ss-fade-in-opaque{
    animation-duration: .25s;
    animation-fill-mode: forwards;
    animation-name: ss-fade-in-opaque;
    animation-timing-function: linear;
    
    -webkit-animation-duration: .25s;
    -webkit-animation-fill-mode: forwards;
    -webkit-animation-name: ss-fade-in-opaque;
    -webkit-animation-timing-function: linear;
}

@keyframes ss-fade-in-opaque {
    0% {opacity: 0}
    100% {opacity: 1}
}

@-webkit-keyframes ss-fade-in-opaque {
    0% {opacity: 0}
    100% {opacity: 1}
}

.ss-fade-slide{
    animation-duration: 2s;
    animation-fill-mode: forwards;
    animation-name: ss-fade-slide;
    animation-timing-function: linear;
}
/*
@keyframes ss-fade-slide {
    0% {opacity: 0}
    100% {opacity: 1}
}
*/
.ss-wait{
    position: absolute;
/*
    margin-left: 160px;
    margin-right: 160px;
    margin-top: 140px;
    margin-bottom: 140px;
*/
    z-index: 2000;
}

.ss-wait-line{
    position: absolute;
    top: 0px;
    width: 2px;
    height: 8px;
    background-color: red;
}

.ss-wait-circle{
    position: absolute;
    display: block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: blue;
}
.ss-wait-circle-top{
    top: 0px;
    left: -3.5px;
}
.ss-wait-circle-bottom{
    bottom: 0px;
    left: -3.5px;
}

.ss-wait-dot{
    position: absolute;
    display: block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    left: -1.5px;
}

.ss-loading{
    height: 110px;
    width: 110px;
    left: 50%;
    top: 50%;
    margin-top: -50px;
    margin-left: -50px;
    position: absolute;
}
.ss-loading-icosahedron{
    background:url(<?php echo $staticImgCommon ?>/loading-icosahedron2.gif) center center no-repeat;
}
.ss-loading-circle{
    background:url(<?php echo $staticImgCommon ?>/loading-circle.gif) center center no-repeat;
}

