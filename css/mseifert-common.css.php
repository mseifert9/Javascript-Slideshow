<?php 
header('Content-Type: text/css');
$staticImgCommon = $_GET['static-img-common'];
$staticJsCommon = $_GET['static-js-common'];
$staticSiteRoot = $_GET['static-site-root'];
//$staticTopRoot = $_GET['static-top-root'];
?>

@charset "utf-8";
*{padding:0; margin:0;}
.visibility-hidden {
    visibility: hidden !important;
}
.visibility-visible {
    visibility: visible !important;
}
.display-none {
    display: none !important;
}
.display-block {
    display: block !important;
}
.ms-nocursor{
    cursor: none;
}
.ms-cursor-row-resize{
    cursor: row-resize !important;
}
.ms-cursor-col-resize{
    cursor: col-resize !important;
}

.ms-cursor-resize-ew{
    cursor: ew-resize !important;
}

.ms-cursor-resize-ns{
    cursor: ns-resize !important;
}

.ms-cursor-resize-se {
    cursor: se-resize !important;
}

.ms-cursor-resize-sw {
    cursor: sw-resize !important;
}

.ms-handle-se-triangle, .ms-handle-ne-triangle, .ms-handle-sw-triangle, .ms-handle-nw-triangle {
    position: absolute;
    width: 6px;
    height: 6px;
    font-size: 1px;
    border: none;
    z-index: 2020;
}

.ms-handle-se-triangle {
    right: 1px;
    bottom: 1px;
    cursor: se-resize;
}

.ms-handle-ne-triangle {
    right: 1px;
    top: 1px;
    cursor: ne-resize;
}

.ms-handle-sw-triangle {
    left: 1px;
    bottom: 1px;
    cursor: sw-resize;
}

.ms-handle-nw-triangle {
    left: 1px;
    top: 1px;
    cursor: nw-resize;
}
.ms-handle-se-triangle {
    background: transparent  url(<?php echo $staticImgCommon ?>/design-sprite.png) no-repeat 0px 0px;
}
.ms-handle-ne-triangle {
    background: transparent  url(<?php echo $staticImgCommon ?>/design-sprite.png) no-repeat -7px 0px;
}
.ms-handle-nw-triangle {
    background: transparent  url(<?php echo $staticImgCommon ?>/design-sprite.png) no-repeat -14px 0px;
}
.ms-handle-sw-triangle {
    background: transparent  url(<?php echo $staticImgCommon ?>/design-sprite.png) no-repeat -21px 0px;
}
.ms-handle-se-triangle-green {
    background: transparent  url(<?php echo $staticImgCommon ?>/design-sprite.png) no-repeat -28px 0px;
}
.ms-handle-ne-triangle-green {
    background: transparent  url(<?php echo $staticImgCommon ?>/design-sprite.png) no-repeat -35px 0px;
}
.ms-handle-nw-triangle-green {
    background: transparent  url(<?php echo $staticImgCommon ?>/design-sprite.png) no-repeat -42px 0px;
}
.ms-handle-sw-triangle-green {
    background: transparent  url(<?php echo $staticImgCommon ?>/design-sprite.png) no-repeat -49px 0px;
}

.ms-handle-n, .ms-handle-s, .ms-handle-e, .ms-handle-w,
.ms-handle-nw, .ms-handle-ne, .ms-handle-sw, .ms-handle-se { 
    position: absolute;
    width: 6px;
    height: 6px;
    font-size: 1px;
    background: transparent  url(<?php echo $staticImgCommon ?>/design-sprite.png) no-repeat -56px 0px;
    border: none;
}

.ms-handle-n {
    left: 50%;
    transform: translate(-50%, 0%);
    top: 0;
    cursor: ns-resize;
}

.ms-handle-s {
    left: 50%;
    transform: translate(-50%, 0%);
    bottom: 0;
    cursor: ns-resize;
}

.ms-handle-e {
    top: 50%;
    transform: translate(0%, -50%);
    right: 0;
    cursor: ew-resize;
}

.ms-handle-w {
    top: 50%;
    transform: translate(0%, -50%);
    left: 0;
    cursor: ew-resize;
}

.ms-handle-se {
    right: 0;
    bottom: 0;
    cursor: se-resize;
}

.ms-handle-sw {
    left: 0;
    bottom: 0;
    cursor: sw-resize;
}

.ms-handle-ne {
    right: 0;
    top: 0;
    cursor: ne-resize;
}

.ms-handle-nw {
    left: 0;
    top: 0;
    cursor: nw-resize;
}

.ms-title-bar {
    text-align: center;
    /* font-size: 120%; */
    width: 100%;
    font-weight: bold;
    background: -moz-linear-gradient(top,  rgba(145,145,145,1) 0%, rgba(145,145,145,0.51) 100%); /* FF3.6-15 */
    background: -webkit-linear-gradient(top,  rgba(145,145,145,1) 0%,rgba(145,145,145,0.51) 100%); /* Chrome10-25,Safari5.1-6 */
    background: linear-gradient(to bottom,  rgba(145,145,145,1) 0%,rgba(145,145,145,0.51) 100%); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#919191', endColorstr='#82919191',GradientType=0 ); /* IE6-9 */
}

.ms-slider-arrow-top-unselected, .ms-slider-arrow-top-selected, .ms-slider-arrow-bottom-unselected, .ms-slider-arrow-bottom-selected {
    height: 17px;
    width: 11px;
    display: inline-block;
    cursor: default;
}
.ms-slider-arrow-top-unselected {
    background: url(<?php echo $staticJsCommon ?>/colorpicker/img/gradient-arrow-sprite.png)  no-repeat 0px 0px;
}

.ms-slider-arrow-top-selected {
    background: url(<?php echo $staticJsCommon ?>/colorpicker/img/gradient-arrow-sprite.png)  no-repeat -11px 0px;
}

.ms-slider-arrow-bottom-unselected {
    background: url(<?php echo $staticJsCommon ?>/colorpicker/img/gradient-arrow-sprite.png)  no-repeat 0px -17px;
}

.ms-slider-arrow-bottom-selected {
    background: url(<?php echo $staticJsCommon ?>/colorpicker/img/gradient-arrow-sprite.png)  no-repeat -11px -17px;
}

.ms-slider-arrow-inner {
    position: absolute;
    left: 2px;
    width: 7px;
    height: 7px;
}

.ms-slider-arrow-inner-opacity {
    position: absolute;
    top: 3px;
}
.ms-slider-arrow-inner-color {
    top: 7px;
}

.ms-colorpicker img {
    display: block;    
}
/* css reset for descendants */
.ms-colorpicker *, .ms-gradient * {padding:0; margin:0; border:0}
.ms-colorpicker textarea, .ms-colorpicker input, .ms-colorpicker button, .ms-colorpicker select,
.ms-gradient textarea, .ms-gradient input, .ms-gradient button, .ms-gradient select { 
    font-family: inherit; 
    font-size: inherit; 
}
.ms-colorpicker, .ms-gradient {
    font-family: verdana,arial,sans-serif;
    background-color: rgb(230,230,230);
    border: 4px solid rgb(200,200,200);
    width: 570px;
    padding:0;
    position: absolute;
    line-height: 18px;
    z-index: 1000;
    cursor: default;
    box-sizing: border-box;
}

.ms-colorpicker *, .ms-gradient * {
    box-sizing: inherit;
}
.ms-gradient-left-outer {
    display: inline-block;
    width: 395px;
    margin-right: 10px;
    padding-left: 10px;
    cursor: default;
}
.ms-gradient-direction{
    margin-bottom: -14px;
    margin-left: 7px;
    background-color: rgb(230,230,230);
    width: 170px;
    position: relative;
    padding: 0 5px;
    z-index: 1;
}
ms-gradient-degrees{
    margin-bottom: -15px;
    margin-right: 7px;
    background-color: rgb(230,230,230);
    width: 100px;
    position: relative;
    padding: 0 5px;
}
.ms-gradient-slider-outer {
    position: relative;
    border: 3px groove rgb(185,185,185);
    margin-top: 5px;
    padding-left: 15px;
    padding-top: 3px;
    padding-bottom: 3px;
}
.ms-gradient-title-stops {
    margin-bottom: -8px;
    margin-left: 7px;
    background-color: rgb(230,230,230);
    width: 40px;
    position: relative;
    padding: 0 5px;
}
.ms-gradient-stop-table {
    width: 100%;
    border: 3px groove rgb(185,185,185);
    padding-top: 10px;
    padding-bottom: 10px;
}
.ms-gradient-slider-bar:hover {
    cursor: url(<?php echo $staticJsCommon ?>/colorpicker/img/gradient-add.png) 10 0, pointer;
}
.ms-gradient-delete-bar:hover {
    cursor: url(<?php echo $staticJsCommon ?>/colorpicker/img/gradient-delete.png), pointer;
}
.ms-gradient-delete-bar-not-allowed:hover {
    cursor: url(<?php echo $staticJsCommon ?>/colorpicker/img/gradient-not-allowed.png), pointer;
}
.ms-gradient-reset {
    background: url(<?php echo $staticJsCommon ?>/colorpicker/img/gradient-reset.png) no-repeat top left;
    bottom: 0px;
    left: 0px;
    position: absolute;
    width: 10px;
    height: 12px;
}
.ms-gradient-reset:hover {
    bottom: 1px;
    left: 1px;
}
.ms-gradient-reverse {
    background: url(<?php echo $staticJsCommon ?>/colorpicker/img/gradient-reverse.png) no-repeat top left;
    bottom: 0px;
    left: 15px;
    position: absolute;
    width: 17px;
    height: 12px;
}
.ms-gradient-reverse:hover {
    bottom: 1px;
    left: 16px;
}
.ms-gradient-opacity-bar:after {
    content: "Opacity";
    position: relative;
    top: -20px;
    left: 50%;
    margin-left: -4px;
    z-index: -1;
    color: rgb(165,165,165);
  }
.ms-gradient-color-bar:after {
    content: "Color";
    position: relative;
    top: 20px;
    left: 50%;
    margin-left: 0px;
    z-index: -1;
    color: rgb(165,165,165);
  }

.ms-gradient-tab-container {
    margin-top: 10px;
    margin-bottom: 5px;
    width: 350px;
    min-height: 134px;
    height: 134px;
    border: 1px solid black;
    display: inline-block;
    vertical-align: top;
    resize: vertical;
}
.ms-gradient-tab-container-narrow {
    width: 275px !important;
}

.ms-gradient-tabs > ul {
    height:25px;
    background-color: #AAA;
}

.ms-gradient-preview-outer {
    width: 100%;
    height: 100%;
}
.ms-gradient-preview-wrapper{
    width: calc(50%);
    height: 100%;
    border: 1px solid black;
    display: inline-block;
    vertical-align: top;
}
.ms-gradient-preview-inner, .ms-gradient-preview-wrapper2 {
    width: 100%;
    height: 100%;
}
.ms-gradient-css {
    width: 100%;
    height: calc(100% - 25px);
    background-color: white;
}
.ms-gradient-css:hover .ms-gradient-copy-button, .ms-cp-css:hover .ms-cp-copy-button, .ms-gradient-import-button {
    display: block;
}
.ms-gradient-copy-button, .ms-gradient-import-button{
    right: 16px;
    bottom: 2px;
    position: absolute;
    z-index: 100;
/*    display: none; */
}
.ms-gradient-css-text {
    font-size: 100%;
    height: calc(100% - 25px);
    width: 100%;
    background-color: white;
    overflow-x: auto;
    position: relative;
}
.ms-gradient-css-text > div {
    margin-left: 25px;
    text-indent: -20px;
}
.ms-gradient-copy-status{
    height: 20px;
    position: absolute;
    right: 65px;
    bottom: 8px;
    color: red;
    background-color: rgb(230,230,230);
    border: 1px solid rgb(200,200,200);
    border-radius: 2px;
    z-index: 100;
    width: 140px;
    text-align: center;
}
.ms-gradient-layers-outer{
    width: 100%;
    height: calc(100%);
}  
.ms-gradient-layers-listbox, .ms-gradient-export-input{
    width: 50%;
    height: calc(100% - 25px);
    display: inline-block;
    vertical-align: top;
}  
.ms-gradient-layers-listbox ul{
    width: 100%;
    height: calc(100% - 20px) !important;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: rgb(230,230,230);
}  
.ms-gradient-layers-listbox ul li{
    width: 100%;
    height: 30px;
    padding: 5px;
    background-color: white;
    display: block;
    border: 1px solid rgb(200,200,200);
}  
.ms-gradient-layer-selected{
    /* background-color: rgb(230,230,230) !important; */
    background: url(<?php echo $staticJsCommon ?>/img-common/selected.png) no-repeat top right;
    border: 1px solid black !important;
}  
.ms-gradient-layers-listbox ul li div{
    width: 100%;
    height: 20px;    
}  
.ms-gradient-layer-button-div{
    position: absolute;
    bottom: 0px;
    left: 0;
    background: rgb(230,230,230);
    height: 20px;
    width: 50%;
    vertical-align: center;
}
.ms-gradient-layer-button{
    margin: 0 5px 0 5px;
}
.ms-gradient-color-stop-input {
    display: inline-block;
    border: 1px solid rgb(150,150,150);
    width: 100px;
    height: 18px;
    vertical-align: middle;
}
.ms-gradient-color-stop-button {
    vertical-align: middle !important;
    height: 18px;
    color: rgb(135,135,135) !important;
    margin-left: -1px;
}

.ms-slider-bar{
    height: 12px;
    background-color: rgb(255,255,255);
    border: solid 1px rgb(200,200,200);
    display: inline-block;
}

.ms-slider-bar-container{
    height: 14px;
    min-height: 14px;
    margin-top: 4px;
    margin-bottom: 4px;
    margin-left: 5px;    
    vertical-align : middle;
    position: relative;
    display: inline-block;
}

.ms-slider-input{
}
.ms-slider-units  {
    margin-left: 5px;    
}

.ms-disabled {
    background: #bbbbbb !important;
    tab-index: -1;
}
.ms-disabled:hover {
    background: #bbbbbb;
    content: "disabled";
}

.ms-close-button{
    background: url(<?php echo $staticImgCommon ?>/design-close.gif) no-repeat top right;
    display: inline-block;
    width: 20px;
    height: 20px;
    cursor: default;
    position: absolute;
    top: 0;
    right: 0;
}

.ms-pinned-button, .ms-unpinned-button{
    display: inline-block;
    width: 20px;
    height: 20px;
    cursor: default;
    position: absolute;
    top: 0;
    right: 20px;
}

.ms-pinned-button{
    background: url(<?php echo $staticJsCommon ?>/colorpicker/img/pin-sprite.png) no-repeat 0px 0px;;
}
.ms-unpinned-button{
    background: url(<?php echo $staticJsCommon ?>/colorpicker/img/pin-sprite.png) no-repeat -21px 0px;;
}

.ms-cp-right-outer, .ms-gradient-right-outer {
	display: inline-block;
	position: relative;
	right: 5px;
	float: right;
}
.ms-cp-disable-color {
    position: absolute;
    top: 22px;
    left: 2px;
    width: 300px;
    height: 262px;
    background-color: grey;
    z-index: 1000;
    opacity: .85;
}

.ms-cp-transparent-grid {
    background: url(<?php echo $staticJsCommon ?>/colorpicker/img/transparent-grid.png) repeat top left;
}

.ms-cp-button{
    margin: 3px 0;
}

.ms-gradient-label, .cp-label {
    margin-right: 5px;
    display: inline-block;
}

.ms-cp-lib-container{
    display: inline-block;
    width: 132px;
    /* overflow: hidden;*/
    background-color: rgb(230,230,230);
}
.ms-cp-lib-inner{	
    height: 155px;
    margin-bottom: 5px;
    overflow-y: scroll;
    position: relative;
}

.ms-cp-lib-handle {
    width: 15px;
    height: 155px;
    float: left;
    margin-right: 2px;
    display: flex;
    justify-content: center;
    cursor: move;
    background: -moz-linear-gradient(right,  rgba(145,145,145,1) 0%, rgba(145,145,145,0.51) 100%); /* FF3.6-15 */
    background: -webkit-linear-gradient(right,  rgba(145,145,145,1) 0%,rgba(145,145,145,0.51) 100%); /* Chrome10-25,Safari5.1-6 */
    background: linear-gradient(to right,  rgba(145,145,145,1) 0%,rgba(145,145,145,0.51) 100%); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#919191', endColorstr='#82919191',GradientType=0 ); /* IE6-9 */
}

.ms-cp-lib-handle-image {
    width: 7px;
    height: 14px;
    align-self: center;
    background: transparent  url(<?php echo $staticImgCommon ?>/design-sprite.png) no-repeat 0 -7px;
}

.ms-cp-css {
    width: 285px; 
    height: 100%;
    position: relative;
    border: 1px solid rgb(200,200,200);
}
.ms-cp-css-text {
    width: 100%;
    height: 30px;
    padding: 1px 0;
    overflow: hidden;
    font-size: 90%;
    position: relative;
}
.ms-cp-copy-button{
    right: 1px;
    bottom: -3px;
    position: absolute;
    z-index: 100;
    display: none;
    font-size: 90% !important;
    line-height: 12px;
}

/**** OUTER **************************/
.ms-cp-lib-container-open{
    width: 242px; 
    margin-left: -110px;
}
.ms-cp-lib-container-close{
    width: 132px;
    margin-left: 0px;
}
@keyframes ms-cp-lib-container-animate-open {
    0% {width: 132px; margin-left: 0px}
    100% {width: 242px; margin-left: -110px}
}

.ms-cp-lib-container-animate-open{
    animation-duration: .25s;
    animation-fill-mode: forwards;
    animation-name: ms-cp-lib-container-animate-open;
    animation-timing-function: linear;
    
    -webkit-animation-duration: .25s;
    -webkit-animation-fill-mode: forwards;
    -webkit-animation-name: ms-cp-lib-container-animate-open;
    -webkit-animation-timing-function: linear;    
}

@keyframes ms-cp-lib-container-animate-close {
    0% {width: 242px; margin-left: -110px}
    100% {width: 132px; margin-left: 0px}
}

.ms-cp-lib-container-animate-close{
    animation-duration: .25s;
    animation-fill-mode: forwards;
    animation-name: ms-cp-lib-container-animate-close;
    animation-timing-function: linear;
    
    -webkit-animation-duration: .25s;
    -webkit-animation-fill-mode: forwards;
    -webkit-animation-name: ms-cp-lib-container-animate-close;
    -webkit-animation-timing-function: linear;    
}

.ms-cp-lib-color-div{
    display: inline-block;
    height: 30px;
    width: 30px;
    border: 1px inset black;
    float: left;
    cursor: pointer;
}
.ms-cp-lib-color-selected{
    border: 2px solid white;
 }
 .ms-cp-lib-color-highlighted{
    border: 2px dashed gray;
 }

.ms-cp-lib-color-swatch{
    display: inline-block;
    height: 100%;
    width: 100%;
    box-sizing: border-box;
}
.ms-checkbox{

}

/* editable select - combo */
.ms-editable-combo-arrow{
    margin-top:1px;
    position:absolute;
    right:0px;
}

.ms-editable-combo-input{
    border: 0px;
    padding-left: 2px;
    height: 18px;
    position: absolute;
    top: 1px;
    /*left: 3px;*/
}

.ms-editable-combo-input-container{
    border:1px solid #ccc;
    height:20px;	

}
.ms-editable-combo-option-container{
    position:absolute;
    border:1px solid #7f9db9;
    background-color:#FFF;
    left:-1px;
    top:20px;
    overflow:auto;
    z-index:1010;
    width: 100%;
}
.ms-editable-combo-iframe{
    position:absolute;
    background-color:#FFF;
    border:0px;
    z-index:999;
}
.ms-editable-combo-option{
    font-family:arial;
    font-size:12px;
    cursor:default;
    margin:1px;
    overflow:hidden;
    white-space:nowrap;
    min-height: 15px;
}

.ms-editable-combo-mouseover{
    background-color: rgb(255, 250, 210);
    color: rgb(0, 0, 0);
}
.ms-editable-combo-selected{
    background-color: rgb(105,115,200) !important;
    color: rgb(255, 255, 255);
}

.ms-tabs{
    width:100%;
    margin-left:0px;
    padding:0; 
    z-index:500;
    background-color: white;
    overflow-y: hidden;
    cursor: default;
}

.ms-tabs ul{
    white-space:nowrap;
    height: initial;	/* !important; */
    position: initial;	/* !important; */
}

.ms-tabs li{
    display: inline-block;  /*  !important */
    font-size: 100%;

    float: initial !important;
    min-width: initial !important;

}

.ms-tabs ul.tab-primary {
    width: 100%;
    margin: 0;	
    padding: 0;
    bottom: -1px;
    font-size:110%; 
    z-index:501;
}

.ms-tabs ul.tab-primary li.tab-current{
    background: #FFF;
}

.ms-tabs ul.tab-primary li,
.ms-tabs ul.tab-primary li.tab-current {
    padding: 2px;
    margin: 1px 2px 0 0;
    text-align: center;
    font-family: tahoma, verdana, sans-serif;
    text-decoration: none;
    color: #333;
    position: relative;	/* must set position for z-index to apply */
    z-index:502;
}

.ms-tabs ul.tab-primary li.tab-current,
.ms-tabs ul.tab-primary li.tab-current:hover {
    border: 1px solid #666;
    border-bottom: none;
    padding-bottom: 3px;  /* covers extra 
    margin-top: 0;  /* pushes tab up 1px */
}

.ms-tabs ul.tab-primary li {
    list-style: none;
    z-index:502;
    background: #DDD;
    border: 1px solid #AAA;
    border-bottom: none;
}

.ms-tabs ul.tab-primary li:hover {
    background: rgb(255, 250, 210);    /* #FFF7CD pale yellow */
}

.ms-gradient-button, input[type="submit"], input[type="reset"], input[type="button"]{
    background: rgb(242,242,242); /* Old browsers */
    background: -moz-linear-gradient(top,  rgb(242,242,242) 0%, rgb(235,235,235) 49%, rgb(221,221,221) 50%, rgb(207,207,207) 100%); /* FF3.6+ */
    background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgb(242,242,242)), color-stop(49%,rgb(235,235,235)), color-stop(50%,rgb(221,221,221)), color-stop(100%,rgb(207,207,207))); /* Chrome,Safari4+ */
    background: -webkit-linear-gradient(top,  rgb(242,242,242) 0%,rgb(235,235,235) 49%,rgb(221,221,221) 50%,rgb(207,207,207) 100%); /* Chrome10+,Safari5.1+ */
    background: -o-linear-gradient(top,  rgb(242,242,242) 0%,rgb(235,235,235) 49%,rgb(221,221,221) 50%,rgb(207,207,207) 100%); /* Opera 11.10+ */
    background: -ms-linear-gradient(top,  rgb(242,242,242) 0%,rgb(235,235,235) 49%,rgb(221,221,221) 50%,rgb(207,207,207) 100%); /* IE10+ */
    background: linear-gradient(to bottom,  rgb(242,242,242) 0%,rgb(235,235,235) 49%,rgb(221,221,221) 50%,rgb(207,207,207) 100%); /* W3C */
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#f2f2f2', endColorstr='#cfcfcf',GradientType=0 ); /* IE6-9 */

    border: 1px #666 solid !important;
    padding: 1px 3px;
    color: #333 !important;
    text-decoration: none !important;
    font-family:Verdana, Arial, Helvetica, sans-serif; 
    font-weight: normal !important;
    font-size:100%;
    text-align: center;
    cursor: pointer;
}

.ms-gradient-button:hover, input[type="submit"]:hover, input[type="reset"]:hover, input[type="button"]:hover{
    background: rgb(234,246,253); /* Old browsers */
    background: -moz-linear-gradient(top,  rgb(234,246,253) 0%, rgb(217,240,252) 49%, rgb(190,230,253) 50%, rgb(167,217,245) 100%); /* FF3.6+ */
    background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgb(234,246,253)), color-stop(49%,rgb(217,240,252)), color-stop(50%,rgb(190,230,253)), color-stop(100%,rgb(167,217,245))); /* Chrome,Safari4+ */
    background: -webkit-linear-gradient(top,  rgb(234,246,253) 0%,rgb(217,240,252) 49%,rgb(190,230,253) 50%,rgb(167,217,245) 100%); /* Chrome10+,Safari5.1+ */
    background: -o-linear-gradient(top,  rgb(234,246,253) 0%,rgb(217,240,252) 49%,rgb(190,230,253) 50%,rgb(167,217,245) 100%); /* Opera 11.10+ */
    background: -ms-linear-gradient(top,  rgb(234,246,253) 0%,rgb(217,240,252) 49%,rgb(190,230,253) 50%,rgb(167,217,245) 100%); /* IE10+ */
    background: linear-gradient(to bottom,  rgb(234,246,253) 0%,rgb(217,240,252) 49%,rgb(190,230,253) 50%,rgb(167,217,245) 100%); /* W3C */
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#eaf6fd', endColorstr='#a7d9f5',GradientType=0 ); /* IE6-9 */

    border-style: inset;
    text-decoration: none;
}	

/* listbox */
div.listbox {
    min-width: 150px;
    overflow: auto;
    outline: 1px solid black;
    display: flex;
    flex-flow: row wrap;
    align-content: flex-start;	/* keep ul at top */
}

div.listbox .ms-title-bar {
    flex: 0 0 auto;
    height: 20px;
}

div.listbox-edit {
    font-size: 100%;
    padding-left: 5px;
}

.listbox-list{
    width: 200px;
    vertical-align: top;
}

div.listbox ul {
    flex: 1 1 auto;
    width: 100%;
    margin:0;
    list-style:none; 
    background: rgb(240, 240, 240); 
    position:relative; 
    z-index:200;
    color:#555;
    height: calc(100% - 20px);
    overflow-y: auto;
}

div.listbox h2 {
    padding:0;
    margin:0;
    font-size: 110%;
}

div.listbox li{
    outline: 1px dotted black; 
    min-height: 20px;
    font-size: 120%;
    width: 100%;
    display: inline-block;
}

div.listbox li.listbox-dragover{
    outline: 2px solid red; 
}

/* three &nbsp; before */
div.listbox li::before{
    content: "\00A0\00A0\00A0";
    float: left;
}

div.listbox li.draggable::before{
    content: "\2016\00A0\00A0";	/* ‖ */
    float: left;
}

/* empty before */
div.listbox li.design-button::before{
    content: "";
}

div.listbox li:hover {
    z-index:300; 
    background: rgb(200,200,200)
}

/* for listbox */
div.listbox li.selected {background: rgb(200,200,220)}

div.listbox li.anchor {
    outline:1px solid blueviolet; 
}

label.listbox-new-label{
    width: calc(100% - 50px);
    white-space: nowrap;
}
input.listbox-new-input{
    width: auto;
    background-color: white;
}

.ms-button-tool{
    vertical-align: text-bottom;
    width: 16px;
    padding-top: 0;
    padding-bottom: 0;
    display: inline-block;
    position: relative;
}
.ms-no-select{
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

.ms-highlight-background {
    background-color: rgb(255, 250, 210) !important;
}
.ms-highlight-border {
    border: 2px solid black !important;
}
.ms-highlight-box-shadow {
    box-shadow: 2px 2px 2px black;
}


@keyframes ms-onload {  
    from {  
        outline-color: #fff; 
    }
    to {  
        outline-color: #000;
    }  
}

.ms-onload {
    animation-duration: 0.01s;
    animation-name: ms-onload;
}

/*
.ms-hsl-overlay {
	background: -moz-linear-gradient(top, hsl(0, 0%, 100%) 0%, hsla(0, 0%, 100%, 0) 50%, hsla(0, 0%, 0%, 0) 50%, hsl(0, 0%, 0%) 100%), -moz-linear-gradient(left, hsl(0, 0%, 50%) 0%, hsla(0, 0%, 50%, 0) 100%);
	background: -webkit-linear-gradient(top, hsl(0, 0%, 100%) 0%, hsla(0, 0%, 100%, 0) 50%, hsla(0, 0%, 0%, 0) 50%, hsl(0, 0%, 0%) 100%), -webkit-linear-gradient(left, hsl(0, 0%, 50%) 0%, hsla(0, 0%, 50%, 0) 100%);
	background: -ms-linear-gradient(top, hsl(0, 0%, 100%) 0%, hsla(0, 0%, 100%, 0) 50%, hsla(0, 0%, 0%, 0) 50%, hsl(0, 0%, 0%) 100%), -ms-linear-gradient(left, hsl(0, 0%, 50%) 0%, hsla(0, 0%, 50%, 0) 100%);
	background: -o-linear-gradient(top, hsl(0, 0%, 100%) 0%, hsla(0, 0%, 100%, 0) 50%, hsla(0, 0%, 0%, 0) 50%, hsl(0, 0%, 0%) 100%), -o-linear-gradient(left, hsl(0, 0%, 50%) 0%, hsla(0, 0%, 50%, 0) 100%);
	background: linear-gradient(to bottom, hsl(0, 0%, 100%) 0%, hsla(0, 0%, 100%, 0) 50%, hsla(0, 0%, 0%, 0) 50%, hsl(0, 0%, 0%) 100%), linear-gradient(to right, hsl(0, 0%, 50%) 0%, hsla(0, 0%, 50%, 0) 100%);
}

.ms-rgb-overlay {
	background: -moz-linear-gradient(bottom, #000 0%, rgba(0, 0, 0, 0) 100%), -moz-linear-gradient(left, #FFF 0%, rgba(255, 255, 255, 0) 100%);
	background: -webkit-linear-gradient(bottom, #000 0%, rgba(0, 0, 0, 0) 100%), -webkit-linear-gradient(left, #FFF 0%, rgba(255, 255, 255, 0) 100%);
	background: -ms-linear-gradient(bottom, #000 0%, rgba(0, 0, 0, 0) 100%), -ms-linear-gradient(left, #FFF 0%, rgba(255, 255, 255, 0) 100%);
	background: -o-linear-gradient(bottom, #000 0%, rgba(0, 0, 0, 0) 100%), -o-linear-gradient(left, #FFF 0%, rgba(255, 255, 255, 0) 100%);
	background: linear-gradient(to top, #000 0%, rgba(0, 0, 0, 0) 100%), linear-gradient(to right, #FFF 0%, rgba(255, 255, 255, 0) 100%);
}
*/

