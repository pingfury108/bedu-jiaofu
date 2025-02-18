
var	bkbkbkook=false;
var nScaleMulti=1;

var fontsize=18;
var g_fontstyle="black";

var g_gap=22;






var lineHeight;

var gctx;
var gcanvas;
var glx,gly;
var gcx,gcy;

var lastX,lastY;
var curX,curY;
var mouseIsDown = 0;
var mouseCaptured=false;
var curCaptured_canv_idx=-1;
var curCaptured_canv=null;

var bodyMouseX,bodyMouseY;

var traceMouse;

var g_lineWidth=5;
var g_lineColor="#ff0000";
var g_lineStyle=0;








var gVerti=[];



var gArrPoints=[];

var gfactor1=[],gfactor2=[];gproduct=[];
var gstartX=0,gstartY=0;
var gcur_type=2;
var math_form="";
var math_form_arr=[];
var pre_factor1=[];
var pre_factor2=[];
var pre_factor3=[];
var cur_pre=[];
var operator=[];

var language="zh-CN";

function check_language()
{
  let userLanguage = navigator.language || navigator.userLanguage;
  language= userLanguage;
}

function findIn(arr,v)
{
  var i;
  for (i=0;i<arr.length;i++)
    if (arr[i]==v)
      break;

  return i<arr.length;
}

function copyArr(dst,src)
{
	dst.splice(0,dst.length);

  var i;
  for (i=0;i<src.length;i++)
    dst.push(src[i]);
}

function backspace()
{
  if (cur_pre.length>0)
    {
    	cur_pre.pop();
     	math_form_arr.pop();
    }
  else
    {
		if (isCalcuLable(math_form_arr[math_form_arr.length-1]))
        {
          math_form_arr.pop();

          if (pre_factor1.length>0)
            {
          		copyArr(cur_pre,pre_factor1);
				pre_factor1.splice(0,pre_factor1.length);
            }
        }
      else
        {
          math_form_arr.splice(0,math_form_arr.length);
          cur_pre.splice(0,cur_pre.length);
        }
    }

  checkDotandDivStat();

  math_form=math_form_arr.join("");
  var obj=document.getElementById("math_formula")
  obj.innerHTML=math_form;
}

function clearAll()
{
	math_form=math_form_arr.join("");
	math_form_arr.splice(0,math_form_arr.length);
	cur_pre.splice(0,cur_pre.length);
	pre_factor1.splice(0,pre_factor1.length);
	pre_factor2.splice(0,pre_factor2.length);

	operator.splice(0,operator.length);

	checkDotandDivStat();



	var obj=document.getElementById("math_formula")
	obj.innerHTML=math_form;

	var c = document.getElementById("scrawlArea");
	if (!c.getContext) return;

	var ctx = c.getContext("2d");

	ctx.clearRect (0,0, c.width, c.height);

	gVerti.splice(0,gVerti.length);

	/*arrFactor1.splice(0,arrFactor1.length);
	arrFactor2.splice(0,arrFactor2.length);
	arrAmonRlt.splice(0,arrAmonRlt.length);
	arrFormula.splice(0,arrFormula.length);

	gproduct.splice(0,gproduct.length);*/

	gArrPoints.splice(0,gArrPoints.length);

	curCaptured_canv_idx=-1;
	curCaptured_canv=null;





	gstartX=0;
	gstartY=0;
}

function clearInput()
{
	math_form=math_form_arr.join("");
	math_form_arr.splice(0,math_form_arr.length);
	cur_pre.splice(0,cur_pre.length);
	pre_factor1.splice(0,pre_factor1.length);
	pre_factor2.splice(0,pre_factor2.length);

	operator.splice(0,operator.length);

	checkDotandDivStat();


	var obj=document.getElementById("math_formula")
	obj.innerHTML=math_form;
}

function disableCalcuLableStat(bDisable)
{
	var disp;
	var bgc;
	var strDisabled;
	if (bDisable)
	{
		disp="block";
		bgc="cccccc";
		strDisabled="disabled";
	}
	else
	{
		disp="inline";
		bgc="";
		strDisabled="";
	}

	document.getElementById("numb_add").style.display=disp;
	document.getElementById("numb_add").style.backgroundColor=bgc;
	document.getElementById("numb_add").disabled=strDisabled;

	document.getElementById("numb_sub").style.display=disp;
	document.getElementById("numb_sub").style.backgroundColor=bgc;
	document.getElementById("numb_sub").disabled=strDisabled;

	document.getElementById("numb_mul").style.display=disp;
	document.getElementById("numb_mul").style.backgroundColor=bgc;
	document.getElementById("numb_mul").disabled=strDisabled;

	document.getElementById("numb_div").style.display=disp;
	document.getElementById("numb_div").style.backgroundColor=bgc;
	document.getElementById("numb_div").disabled=strDisabled;
}

function isCalcuLable(v)
{
	if (v=="+" || v=="-" || v=="×" || v=="÷")
		return true;
	else
		return false;
}

function addsubCount(math_arr)
{
	var cnt=0;
	for (var i in math_arr)
	{
		if (math_arr[i]=='+' || math_arr[i]=='-')
			cnt++;
	}

	return cnt;
}

function checkDotandDivStat()
{
  if (findIn(cur_pre,".") || cur_pre.length==0)
    {
		document.getElementById("numb_dot").style.display="block";
		document.getElementById("numb_dot").style.backgroundColor="cccccc";
		document.getElementById("numb_dot").disabled="disabled";
    }
  else if (cur_pre.length>0)
    {
		document.getElementById("numb_dot").style.display="inline";
		document.getElementById("numb_dot").style.backgroundColor="";
		document.getElementById("numb_dot").disabled="";
    }

  if (findIn(math_form_arr,"×")||findIn(math_form_arr,"÷")
		|| addsubCount(math_form_arr)>=2
		|| math_form_arr[math_form_arr.length-1]=="." ||math_form_arr.length==0
		)

    {
		disableCalcuLableStat(true);


    }
  else
   if (math_form_arr.length>0 && math_form_arr[math_form_arr.length-1]!=".")
    {


		disableCalcuLableStat(false);
    }

  if (math_form_arr.length==0)
   {
      for (i=0;i<=9;i++)
        {
            document.getElementById("numb_" + i).style.display="inline";
            document.getElementById("numb_" + i).style.backgroundColor="";
            document.getElementById("numb_" + i).disabled="";
        }
   }


   if (findIn(math_form_arr,"×") && math_form_arr[math_form_arr.length-1]!="×"
		|| findIn(math_form_arr,"+") && math_form_arr[math_form_arr.length-1]!="+"
		|| findIn(math_form_arr,"-") && math_form_arr[math_form_arr.length-1]!="-"
		|| findIn(math_form_arr,"÷") && math_form_arr[math_form_arr.length-1]!="÷")
   {
		document.getElementById("createdivia").style.backgroundColor="#9999ff";
		document.getElementById("createdivia_blank").style.backgroundColor="#9999ff";
		document.getElementById("createdivia").disabled="";
		document.getElementById("createdivia_blank").disabled="";
   }
   else
   {
		document.getElementById("createdivia").style.backgroundColor="";
		document.getElementById("createdivia_blank").style.backgroundColor="";
		document.getElementById("createdivia").disabled="disabled";
		document.getElementById("createdivia_blank").disabled="disabled";
   }

  document.getElementById("infotip").innerHTML="";
}

function checkMath(v,divobj)
{
  if (v!="." && !isCalcuLable(v) && cur_pre.length>6 )
    {
		if (cur_pre.length>6)
			document.getElementById("infotip").innerHTML="不能太大、太长！";

		return;
    }

  var i;
  if (v==".")
    {
      if (cur_pre.length>0 && !findIn(cur_pre,v))
        {
          cur_pre.push(v);
          math_form_arr.push(v);

          divobj.style.display="block";
          divobj.style.backgroundColor="cccccc";
          divobj.disabled="disabled";
        }

		for (i=0;i<=9;i++)
		{
				document.getElementById("numb_" + i).style.display="inline";
				document.getElementById("numb_" + i).style.backgroundColor="";
				document.getElementById("numb_" + i).disabled="";
		}




		disableCalcuLableStat(true);

    }
  else
  if (isCalcuLable(v))
	{
	if ((v=='+' || v=='-')
		&& !findIn(math_form_arr,"×")
		&& !findIn(math_form_arr,"÷")
		&& addsubCount(math_form_arr)<2
		)
	{
		 math_form_arr.push(v);
		 operator.push(v);
		gcur_type=4;

	}
	else
	if (math_form_arr.length>0
		&& !findIn(math_form_arr,"+")
		&& !findIn(math_form_arr,"-")
		&& !findIn(math_form_arr,"×")
		&& !findIn(math_form_arr,"÷")
		&& cur_pre[cur_pre.length-1]!=".")
        {
          math_form_arr.push(v);
          operator.push(v);

          switch(v)
          {
			case "+":
				gcur_type=0;
				break;
			case "-":
				gcur_type=1;
				break;
			case "×":
				gcur_type=2;
				break;
			case "÷":
				gcur_type=3;
          }




          }

          disableCalcuLableStat(true);


          for (i=0;i<=9;i++)
          {
                document.getElementById("numb_" + i).style.display="inline";
                document.getElementById("numb_" + i).style.backgroundColor="";
                document.getElementById("numb_" + i).disabled="";
          }




		   if (pre_factor1.length==0)
		   {
			 copyArr(pre_factor1,cur_pre);

		   }
		   else
		   if (pre_factor2.length==0)
		   {
			 copyArr(pre_factor2,cur_pre);
		   }
		   else
			copyArr(pre_factor3,cur_pre);

           cur_pre.splice(0,cur_pre.length) ;


    }
  else
  if (v=="0" && cur_pre.length==0)
    {
      	cur_pre.push(v);
          math_form_arr.push(v);

          for (i=0;i<=9;i++)
            {
             	document.getElementById("numb_" + i).style.display="block";
         		document.getElementById("numb_" + i).style.backgroundColor="cccccc";
         		document.getElementById("numb_" + i).disabled="disabled";
            }
          document.getElementById("numb_dot").style.display="inline";
          document.getElementById("numb_dot").style.backgroundColor="";
          document.getElementById("numb_dot").disabled="";



          disableCalcuLableStat(false);
    }
   else
     {

       if (!(cur_pre[0]=="0" && cur_pre.length==1))
         {
			cur_pre.push(v);
       		math_form_arr.push(v);








         }


     }

  checkDotandDivStat();


  math_form=math_form_arr.join("");
}

function formula(v,divobj)
{
  checkMath(v,divobj);

  var obj=document.getElementById("math_formula")
  obj.innerHTML=math_form;
}

function scaleView(b)
{
	var i;
	if (b)
	{
		if (nScaleMulti<5)
		{
			nScaleMulti*=1.6;
			gctx.scale(1.6,1.6);


			for (i=0;i<gVerti.length;i++)
			{
				var ctx = gVerti[i].canv.getContext("2d");
				ctx.scale(1.6,1.6);
			}

			refreshVertiDisp()
		}
	}
	else
	if (nScaleMulti>=1)
	{
		nScaleMulti/=1.6;
		gctx.scale(1/1.6,1/1.6);


		for (i=0;i<gVerti.length;i++)
		{
			var ctx = gVerti[i].canv.getContext("2d");
			ctx.scale(1/1.6,1/1.6);
		}

		refreshVertiDisp()
	}
}

function refreshVertiDisp(redraw)
{
	var i;

	var gc = document.getElementById("scrawlArea");
	gctx.clearRect(0,0,gc.width,gc.height);

	if (redraw)
	{
		gArrPoints.splice(0,gArrPoints.length);
	}

	for (i=0;i<gVerti.length;i++)
	{
		if (!gVerti[i].active)
			continue;

		if (redraw)
		{
			switch(gVerti[i].type)
			{
			case 0:
				drawJiafa(i);
				break;
			case 1:
				drawJianfa(i);
				break;
			case 2:
				drawChengfa(i);
				break;
			case 3:
				drawDivide(i);
				break;
			case 4:
				drawContinuously(i);
				break;

			}
		}

		gctx.drawImage(gVerti[i].canv,gVerti[i].left,gVerti[i].top);





	}
}

function findNewCanvPos(idx,w,h)
{
	var c = document.getElementById("scrawlArea");

	var left=0,top=0;

	var maxh=0;

	var i;
	while (true)
	{
		for (i=0;i<gVerti.length;i++)
		{
			if (i==idx || gVerti[i].active==false)
				continue;

			if (gVerti[i].left>=left
				&& gVerti[i].top>=top
				&& gVerti[i].left<=left+w
				&& gVerti[i].top<=top+h)
				break;
			else
			if (gVerti[i].left+gVerti[i].w>=left
				&& gVerti[i].top>=top
				&& gVerti[i].left+gVerti[i].w<=left+w
				&& gVerti[i].top<=top+h)
				break;
			else
			if (gVerti[i].left>=left
				&& gVerti[i].top+gVerti[i].h>=top
				&& gVerti[i].left<=left+w
				&& gVerti[i].top+gVerti[i].h<=top+h)
				break;
			else
			if (gVerti[i].left+gVerti[i].w>=left
				&& gVerti[i].top+gVerti[i].h>=top
				&& gVerti[i].left+gVerti[i].w<=left+w
				&& gVerti[i].top+gVerti[i].h<=top+h)
				break;
		}

		if (i<gVerti.length)
		{
			if (maxh<gVerti[i].h)
				maxh=gVerti[i].h;

			if (gVerti[i].left+gVerti[i].w+w+5<=c.width)
				left=gVerti[i].left+gVerti[i].w+5;
			else
			{
				left=0;

				top+=maxh+10;
				maxh=0;

				if (top+h>c.height)
					c.height+=h+1;
			}
		}
		else
		{
			gVerti[idx].left=left;
			gVerti[idx].top=top;

			break;
		}
	}

	var c = document.getElementById("scrawlArea");
	if (top+h>=c.height)
	{
		c.height+=w+3*g_gap;

		refreshVertiDisp(false);
	}
}

function openWithinitForumla()
{
	return;

	var c = document.getElementById("scrawlArea");
	var ncv;

	var type=3;

	var gf1=new Array();
	gf1.push(6);
	gf1.push(1);
	gf1.push(2);

	var gf2=new Array();
	gf2.push(1);
	gf2.push(8);

	ncv = document.createElement("canvas");
	ncv.width = c.width;
	ncv.height = c.height;

	var vertia={"type":type,"blankFormula":false,"left":0,"top":0,"w":c.width,"h":c.height,"canv":ncv,
			"pm1":gf1,"pm2":gf2,"result":[]};

	gVerti.push(vertia);

	type=2;
	gf1=new Array();
	gf1.push(1);
	gf1.push(5);

	var gf2=new Array();
	gf2.push(2);
	gf2.push(8);

	ncv = document.createElement("canvas");
	ncv.width = c.width;
	ncv.height = c.height;

	var vertia={"type":type,"blankFormula":false,"left":c.width/2,"top":0,"w":c.width,"h":c.height,"canv":ncv,
			"pm1":gf1,"pm2":gf2,"result":[]};

	gVerti.push(vertia);

	refreshVertiDisp(true);
}

function createVerti(withoutResult)
{
	var asc=addsubCount(math_form_arr);

	if (asc==1)
	{
		if (math_form.indexOf('+')>0)
			gcur_type=0;
		else
		if (math_form.indexOf('-')>0)
			gcur_type=1;

	}
	////////////////////////////////////////////
	gproduct.splice(0,gproduct.length);

	if (gcur_type!=4 || addsubCount(math_form_arr)<2)
		copyArr(pre_factor2,cur_pre);
	else
		copyArr(pre_factor3,cur_pre);

	if (pre_factor2.length<=0 || pre_factor1.length<=0)
		return;

	var gf1=new Array();
	copyArr(gf1,pre_factor1);

	var gf2=new Array();
	copyArr(gf2,pre_factor2);

	var gf3=new Array();
	if (gcur_type==4)
	{
		copyArr(gf3,pre_factor3);
	}

	var oper=new Array();
	copyArr(oper,operator);

	clearInput();

	bkbkbkook=withoutResult;

	var c = document.getElementById("scrawlArea");

	var ncv = document.createElement("canvas");
	ncv.width = c.width;
	ncv.height = c.height;

	var vertia;

	if (gcur_type!=4)
		vertia={"type":gcur_type,"blankFormula":bkbkbkook,"left":gstartX,"top":gstartY,"w":c.width,"h":c.height,"canv":ncv,
			"pm1":gf1,"pm2":gf2,"operator":oper,"math_form":math_form,"result":[],"active":true};
	else
		vertia={"type":gcur_type,"blankFormula":bkbkbkook,"left":gstartX,"top":gstartY,"w":c.width,"h":c.height,"canv":ncv,
			"pm1":gf1,"pm2":gf2,"pm3":gf3,"operator":oper,"math_form":math_form,"result":[],"active":true};

	var idx=gVerti.push(vertia)-1;

	switch(gcur_type)
	{
	case 0:
		drawJiafa(idx);
		break;
	case 1:
		drawJianfa(idx);
		break;
	case 2:
		drawChengfa(idx);
		break;
	case 3:
		drawDivide(idx);
		break;
	case 4:
		drawContinuously(idx);
		break;
	}

	findNewCanvPos(idx,gVerti[idx].w,gVerti[idx].h);



	var nctx = ncv.getContext("2d");
	var imgData=nctx.getImageData(0,0,ncv.width,ncv.height);

	gctx.putImageData(imgData,gVerti[idx].left,gVerti[idx].top);

	/*
	if (gstartX<c.width/2)
		gstartX=c.width/2+50;
	else
	{
		gstartX=0;

		var mt=gVerti[idx].canv.height;
		if (gVerti[idx-1].canv.height>mt)
			mt=gVerti[idx-1].canv.height;

		gstartY+=mt+50;
	}*/

	document.getElementById("canvasArea").scrollTop=gVerti[idx].top;
}

function IsItMobile()
{
	var ua = navigator.userAgent;

	var ipad = ua.match(/(iPad).*OS\s([\d_]+)/),

	isIphone =!ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),

	isAndroid = ua.match(/(Android)\s+([\d.]+)/),

	isMobile = isIphone || isAndroid;



	if(isMobile)
		return true;
	else

		return false;
}

function drawHeart(){
 var c = document.getElementById("scrawlArea");
 if (c.getContext)
 {
 var cxt = c.getContext("2d");
 cxt.fillStyle="#FF0000";
 cxt.beginPath();
 cxt.moveTo(75,40);
 cxt.bezierCurveTo(75,37,70,25,50,25);
 cxt.bezierCurveTo(20,25,20,62.5,20,62.5);
 cxt.bezierCurveTo(20,80,40,102,75,120);
 cxt.bezierCurveTo(110,102,130,80,130,62.5);
 cxt.bezierCurveTo(130,62.5,130,25,100,25);
 cxt.bezierCurveTo(85,25,75,37,75,40);
 cxt.fill();
 }
}

function isEleVisible(ele){
    var {top, right, bottom, left} = ele.getBoundingClientRect()
    var w = window.innerWidth
    var h = window.innerHeight
    if(bottom < 0 || top > h){
        // y 轴方向
        return false
    }
    if(right < 0 || left > w){
        // x 轴方向
        return false
    }
    return true
}

function onKeydown(e)
{
	var activeObj=document.activeElement;
	if (activeObj.type=="text" || activeObj.type=="textarea")
	{
		if (isEleVisible(activeObj))
			return;
		else
		{
			activeObj.blur();
		}
	}


	var key='';
	var obj=null;

	switch(e.keyCode)
	{
	case 48://0
		if (!e.shiftKey)
		{
			key='0';
			obj=document.getElementById("numb_0");
		}
		break;
	case 96:
		key='0';
		obj=document.getElementById("numb_0");
		break;
	case 49:
		if (!e.shiftKey)
		{
			key='1';
			obj=document.getElementById("numb_1");
		}
		break;
	case 97:
		key='1';
		obj=document.getElementById("numb_1");
		break;
	case 50:
		if (!e.shiftKey)
		{
			key='2';
			obj=document.getElementById("numb_2");
		}
		break;
	case 98:
		key='2';
		obj=document.getElementById("numb_2");
		break;
	case 51:
		if (!e.shiftKey)
		{
			key='3';
			obj=document.getElementById("numb_3");
		}
		break;
	case 99:
		key='3';
		obj=document.getElementById("numb_3");
		break;
	case 52:
		if (!e.shiftKey)
		{
			key='4';
			obj=document.getElementById("numb_4");
		}
		break;
	case 100:
		key='4';
		obj=document.getElementById("numb_4");
		break;
	case 53:
		if (!e.shiftKey)
		{
			key='5';
			obj=document.getElementById("numb_5");
		}
		break;
	case 101:
		key='5';
		obj=document.getElementById("numb_5");
		break;
	case 54:
		if (!e.shiftKey)
		{
			key='6';
			obj=document.getElementById("numb_6");
		}
		break;
	case 102:
		key='6';
		obj=document.getElementById("numb_6");
		break;
	case 55:
		if (!e.shiftKey)
		{
			key='7';
			obj=document.getElementById("numb_7");
		}
		break;
	case 103:
		key='7';
		obj=document.getElementById("numb_7");
		break;
	case 56:
		if (e.shiftKey)
		{
			key='×';
			obj=document.getElementById("numb_mul");
		}
		else
		{
			key='8';
			obj=document.getElementById("numb_8");
		}
		break;
	case 104:
		key='8';
		obj=document.getElementById("numb_8");
		break;
	case 106:
		key='×';
		obj=document.getElementById("numb_mul");
		break;
	case 57:
		if (!e.shiftKey)
		{
			key='9';
			obj=document.getElementById("numb_9");
		}
		break;
	case 105:
		key='9';
		obj=document.getElementById("numb_9");
		break;
	case 8://backspace
		backspace();
		e.preventDefault();
		break;
	case 13://enter
		createVerti(false);//生成空白竖式
		e.preventDefault();
		break;
	case 187://=/+
		if (e.shiftKey)
		{
			key='+';
			obj=document.getElementById("numb_add");
		}
		else
		{
			createVerti(true);//生成计算竖式
			e.preventDefault();
		}
		break;
	case 107:
		key='+';
		obj=document.getElementById("numb_add");
		break;
	case 191:// '/'' and '?''
		if (!e.shiftKey)
		{
			key='÷';
			obj=document.getElementById("numb_div");
		}
		break;
	case 111:
		key='÷';
		obj=document.getElementById("numb_div");
		break;
	case 189:
		if (!e.shiftKey)
		{
			key='-';
			obj=document.getElementById("numb_sub");
		}
		break;
	case 109:
		key='-';
		obj=document.getElementById("numb_sub");
		break;
	case 190:
		if (!e.shiftKey)
		{
			key='.';
			obj=document.getElementById("numb_dot");
		}
		break;
	case 110:
		key='.';
		obj=document.getElementById("numb_dot");
		break;
	case 32:
		{
			clearAll();
			e.preventDefault();
		}
		break;
	}

	if (key!='')
	{
		if (obj.disabled==false)
			formula(key,obj);

		e.preventDefault();
	}
}

function Init()
{


	nScaleMulti=1;

	/*



	*/

	gproduct.splice(0,gproduct.length);


	var tbl;
	var canvas;




	tbl=document.getElementById("tblcurlv");

	canvas=document.getElementById("scrawlArea");

	var winWidth,winHeight;

	if (window.innerWidth)
		winWidth = window.innerWidth;
	else if ((document.body) && (document.body.clientWidth))
		winWidth = document.body.clientWidth;



	if (window.innerHeight)
		winHeight = window.innerHeight;
	else if ((document.body) && (document.body.clientHeight))
		winHeight = document.body.clientHeight;


	/*if (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth)
	{
		winHeight = document.documentElement.clientHeight;
		winWidth = document.documentElement.clientWidth;
	}*/


	canvas.width=winWidth;
	if (canvas.width>1000)
		canvas.width=1000;

	var iarea=document.getElementById("topArea");
	canvas.height=winHeight-iarea.offsetHeight;









	document.getElementById("canvasArea").style.height= canvas.height*0.96



	gcanvas=canvas;
	gctx = canvas.getContext("2d");
	glx=40;
	gly=40;
	gcx=canvas.width;
	gcy=canvas.height;

	lastX=lastY=-1;
	curX=curY=-1;
	curlvExisting=0;
	traceMouse=true;

	bodyMouseX=0;
	bodyMouseY=0;

	canvas.addEventListener("mousedown", mouseDown, false);
	canvas.addEventListener("mousemove", mouseXY, false);
	canvas.addEventListener("touchstart", touchDown, false);
	canvas.addEventListener("touchmove", touchXY, true);
	canvas.addEventListener("touchend", touchUp, false);



	canvas.addEventListener("mouseup", mouseUp, false);
	canvas.addEventListener("touchcancel", touchUp, false);

	canvas.addEventListener("mouseleave", onMouseLeave, false);

	document.addEventListener("keydown",onKeydown);

	firstDraw=true;




	curCaptured_canv_idx=-1;
	curCaptured_canv=null;

	openWithinitForumla();

	var vlanguage=navigator.language || navigator.userLanguage;

	vlanguage=vlanguage.toLowerCase();

	if (vlanguage.indexOf("cn")<0)
	{
		document.getElementById('numb_clear').innerText = "clear";
		document.getElementById('createdivia').innerText = "create";
		document.getElementById('createdivia_blank').innerText = "create blank";

		document.getElementById('toprintit').innerText = "print";
		document.getElementById('todownloadit').innerText = "download";
	}
}


function refreshTime()
{

	{
	var now= new Date();
	var year=now.getFullYear();
	var month=now.getMonth()+1;
	var day=now.getDate();
	var hour=now.getHours();
	var minute=now.getMinutes();
	var second=now.getSeconds();
    	document.getElementById("txtHint").innerHTML=
		"当前时间："+year+"-"+month+"-"+day+" "+hour+":"+minute+":"+second;
	}

	setTimeout("refreshTime()",1000);
}

function drawSquare(vert,x,y,drawit)
{
	var c = vert.canv;
	var ctx=c.getContext("2d");

	var lw=ctx.lineWidth;
	var ss=ctx.strokeStyle;

	var freeGapY=0;
	var freeGapX=0;
	var freeW=1;
	/*if (IsItMobile())
		{
			freeGapY=5;
			freeGapX=3;

			freeW=0;
		}
		*/
	if (drawit)
	{
		ctx.lineWidth="1";
		ctx.strokeStyle="red";

		ctx.clearRect(x-freeW+1,y+2+freeGapY,g_gap*2/3+freeGapX+freeW,lineHeight*0.8);
		ctx.strokeRect(x-freeW+1,y+2+freeGapY,g_gap*2/3+freeGapX+freeW,lineHeight*0.8);

	}
	else
	{


		/*var gradient=ctx.createLinearGradient(0,0,170,0);
		gradient.addColorStop("0","magenta");
		gradient.addColorStop("0.5","blue");
		gradient.addColorStop("1.0","red");


		ctx.strokeStyle=gradient;
		ctx.lineWidth=5;*/



		ctx.clearRect(x-1-freeW+1,y+1+freeGapY,g_gap*2/3+2+freeGapX+freeW,lineHeight*0.8+2);


	}

	ctx.lineWidth=lw;
	ctx.strokeStyle=ss;
}

function checkHisPoint(vert,arr,x,y,onlyJuge)
{
	if (vert.active==false)
		return false;

	var clicked=false;

	var i;

	var left=vert.left,top=vert.top;

	for(i=0;i<arr.length;i++)
	{



		if (x>=arr[i].X+left
			&& x<=arr[i].X+left+g_gap
			&& y<=arr[i].Y+top
			&& y>=arr[i].Y+top-lineHeight
			&& arr[i].V!=".")
		{
			clicked=true;

			if (!onlyJuge)
			{

				var c=vert.canv;
				var ctx=c.getContext("2d");

				if (arr[i].visible==true)
				{
					drawSquare(vert,arr[i].X,arr[i].Y-lineHeight,true);
					arr[i].visible=false;
				}
				else
				{
					drawSquare(vert,arr[i].X,arr[i].Y-lineHeight,false);
					arr[i].visible=true;

					var ft=ctx.font;
					var ta=ctx.textAlign;
					var tb=ctx.textBaseline;
					var ss=ctx.strokeStyle;
					var fs=ctx.fillStyle;
					ctx.font=fontsize+ "pt Times New Roman";

					ctx.textAlign="left";
					ctx.textBaseline="bottom";
					ctx.strokeStyle="#ff0000";

					ctx.fillStyle=g_fontstyle;

					ctx.fillText(arr[i].V,arr[i].X,arr[i].Y);

					ctx.font=ft;
					ctx.textAlign=ta;
					ctx.textBaseline=tb;
					ctx.strokeStyle=ss;
					ctx.fillStyle=fs;



					if (arr[i].crash==true)
					{
						var whh=ctx.lineWidth;
						var sst=ctx.strokeStyle;

						ctx.lineWidth=1;

						ctx.strokeStyle="#ff0000";

						/*if (s==".")
						{
							ctx.moveTo(x+fontsize/10,y-fontsize/2);
							ctx.lineTo(x+fontsize/3,y-fontsize/dotclear_per);
						}
						else*/


						{
							ctx.moveTo(arr[i].X+left,arr[i].Y+top-fontsize);
							ctx.lineTo(arr[i].X+left+2*fontsize/3,arr[i].Y+top-fontsize/3);
						}

						ctx.lineWidth=whh;
						ctx.strokeStyle=sst;

						ctx.stroke();


					}

				}
			}

			break;
		}
	}

	return clicked;
}

function checkPointInRect(vert,x,y)
{
	if (vert.active==false)
		return false;

	var left=vert.left,top=vert.top;

	if (x>=left
			&& x<=vert.w+left
			&& y>=top
			&& y<=vert.h+top
			)
		return true;
	else
		return false;
}

/*

function drawSquare(idx,x,y,drawit)
{
	var c = gVerti[idx].canv;
	var ctx=c.getContext("2d");

	var lw=ctx.lineWidth;
	var ss=ctx.strokeStyle;

	var freeGapY=0;
	var freeGapX=0;
	var freeW=2;

	if (drawit)
	{
		ctx.lineWidth="1";
		ctx.strokeStyle="red";

		ctx.clearRect(x-freeW,y+2+freeGapY,g_gap*2/3+freeGapX+freeW,lineHeight*0.8);
		ctx.strokeRect(x-freeW,y+2+freeGapY,g_gap*2/3+freeGapX+freeW,lineHeight*0.8);

	}
	else
	{


		ctx.clearRect(x-1-freeW,y+1+freeGapY,g_gap*2/3+2+freeGapX+freeW,lineHeight*0.8+2);


	}

	ctx.lineWidth=lw;
	ctx.strokeStyle=ss;
}


function checkHisPoint(idx,arr,x,y,onlyJuge)
{
	if (gVerti[idx].active==false)
		return false;

	var clicked=false;

	var i;

	var left=gVerti[idx].left,top=gVerti[idx].top;

	for(i=0;i<arr.length;i++)
	{



		if (x>=arr[i].X+left
			&& x<=arr[i].X+left+g_gap
			&& y<=arr[i].Y+top
			&& y>=arr[i].Y+top-lineHeight
			&& arr[i].V!=".")
		{
			clicked=true;

			if (!onlyJuge)
			{

				var c=gVerti[idx].canv;
				var ctx=c.getContext("2d");

				if (arr[i].visible==true)
				{
					drawSquare(idx,arr[i].X,arr[i].Y-lineHeight,true);
					arr[i].visible=false;
				}
				else
				{
					drawSquare(idx,arr[i].X,arr[i].Y-lineHeight,false);
					arr[i].visible=true;

					var ft=ctx.font;
					var ta=ctx.textAlign;
					var tb=ctx.textBaseline;
					var ss=ctx.strokeStyle;
					var fs=ctx.fillStyle;
					ctx.font=fontsize+ "pt Times New Roman";

					ctx.textAlign="left";
					ctx.textBaseline="bottom";
					ctx.strokeStyle="#ff0000";

					ctx.fillStyle=g_fontstyle;

					ctx.fillText(arr[i].V,arr[i].X,arr[i].Y);

					ctx.font=ft;
					ctx.textAlign=ta;
					ctx.textBaseline=tb;
					ctx.strokeStyle=ss;
					ctx.fillStyle=fs;



					if (arr[i].crash==true)
					{
						var whh=ctx.lineWidth;
						var sst=ctx.strokeStyle;

						ctx.lineWidth=1;

						ctx.strokeStyle="#ff0000";




						{
							ctx.moveTo(arr[i].X+left,arr[i].Y+top-fontsize);
							ctx.lineTo(arr[i].X+left+2*fontsize/3,arr[i].Y+top-fontsize/3);
						}

						ctx.lineWidth=whh;
						ctx.strokeStyle=sst;

						ctx.stroke();


					}

				}
			}

			break;
		}
	}

	return clicked;
}

function checkPointInRect(idx,x,y)
{
	if (gVerti[idx].active==false)
		return false;

	var left=gVerti[idx].left,top=gVerti[idx].top;

	if (x>=left
			&& x<=gVerti[idx].w+left
			&& y>=top
			&& y<=gVerti[idx].h+top
			)
		return true;
	else
		return false;
}
*/

function jugeIt(x,y,rtv,onlyJuge)
{

	var verti=null;
	var type=-1;

	var i;
	x/=nScaleMulti;
	y/=nScaleMulti;


	var clicked=false;


	for (i=0;i<gArrPoints.length;i++)
	{
		clicked=checkHisPoint(gArrPoints[i].verti,
								gArrPoints[i].arrFactor1,x,y,onlyJuge);

		if (!clicked)
		{
			clicked=checkHisPoint(gArrPoints[i].verti,
								gArrPoints[i].arrFactor2,x,y,onlyJuge);

			if (!clicked)
			{
				clicked=checkHisPoint(gArrPoints[i].verti,
								gArrPoints[i].arrAmonRlt,x,y,onlyJuge);

				if (!clicked)
				{
					clicked=checkHisPoint(gArrPoints[i].verti,
								gArrPoints[i].arrFormula,x,y,onlyJuge);

					if (!clicked)
					{
						clicked=checkPointInRect(gArrPoints[i].verti,x,y);

						if (clicked)
						{

							verti=gArrPoints[i].verti;
							type=1;
						}
					}
				}
			}
		}

		if (clicked)
		{

			if (verti==null)
			{

				verti=gArrPoints[i].verti;
				type=0;



			}

			break;
		}
	}



	rtv.verti=verti;
	rtv.type=type;

	if (type>=0)
		return true;
	else
		return false;
}

function drawCaluAreaRect(verti)
{

	var c = verti.canv;
	var ctx=c.getContext("2d");

	var lw=ctx.lineWidth;
	var ss=ctx.strokeStyle;

	ctx.lineWidth="3";
	var gradient=ctx.createLinearGradient(0,0,170,0);
	gradient.addColorStop("0","magenta");
	gradient.addColorStop("0.5","blue");
	gradient.addColorStop("1.0","red");
	ctx.strokeStyle=gradient;


	ctx.strokeRect(0,0,verti.w,verti.h);

	/*var left=gVerti[idx].w-10-2;
	var top=2;
	var right=gVerti[idx].w-2;
	var bottom=10+2;
	*/
	var left=verti.w-10-2;
	var top=2;
	var right=verti.w-2;
	var bottom=10+2;

	ctx.beginPath();

	ctx.moveTo(left,top);
	ctx.lineTo(right,bottom);

	ctx.moveTo(left,bottom);
	ctx.lineTo(right,top);

	ctx.lineWidth=lw;
	ctx.strokeStyle=ss;
	ctx.stroke();

	ctx.strokeRect(left-1,top,right,bottom);
}

function clearCaluAreaRect(verti)
{
	var c = verti.canv;
	var ctx=c.getContext("2d");

	ctx.clearRect(0,0,verti.w,3);
	ctx.clearRect(verti.w-3,0,verti.w,verti.h);
	ctx.clearRect(0,0,3,verti.h);
	ctx.clearRect(0,verti.h-3,verti.w,verti.h) ;


	var left=verti.w-10-3;
	var top=1;
	var right=verti.w-3;
	var bottom=10+4;
	ctx.clearRect(left-1,top,right,bottom);



}

function clearCanvas()
{
    gctx.setTransform(1, 0, 0, 1, 0, 0);
    gctx.clearRect(0, 0, gctx.canvas.width, gctx.canvas.height);
}

function putToFrontAndSetfocus(verti)
{
	drawCaluAreaRect(verti);


	if (gVerti.length>1 && gVerti[0]!=verti)
	{
		var kdx=0;
		while (kdx<gVerti.length && gVerti[kdx]!=verti)
			kdx++;

		var vt=gVerti[kdx];
		gVerti.splice(kdx,1);
		gVerti.unshift(vt);


		kdx=0;
		while (kdx<gArrPoints.length && gArrPoints[kdx].verti!=verti)
			kdx++;

		var vvt=gArrPoints[kdx];
		gArrPoints.splice(kdx,1);
		gArrPoints.unshift(vvt);
	}


	curCaptured_canv=verti;
}

function processDown(x,y,isTouched)
{
	var vrt=new Object;
	var rt=jugeIt(curX,curY,vrt,true);

	if (isTouched)
	{
		if (curCaptured_canv!=null && curCaptured_canv!=vrt.verti)
		{
			clearCaluAreaRect(curCaptured_canv);



			refreshVertiDisp(false);

			mouseCaptured=false;


			curCaptured_canv=null;
		}

		if (vrt.verti!=null && curCaptured_canv!=vrt.verti)
		{
			putToFrontAndSetfocus(vrt.verti);
		}
	}

	if (rt==true)
	{
		if (vrt.type==1)
		{
			var verti=vrt.verti;
			if (curX>verti.left+verti.w-10-3 && curX<verti.left+verti.w-3 &&
				curY>=verti.top+1 && curY<verti.top+10+4)
			{
				verti.active=false;

				curCaptured_canv=null;

				refreshVertiDisp(false);

				return;
			}
			else
			{
				mouseCaptured=1;


				document.getElementById("scrawlArea").style.cursor="move";
			}
		}








		refreshVertiDisp(false);
	}
}

function processUp(x,y,isTouched)
{
	if (mouseCaptured && !isTouched)
	{

		{
			mouseCaptured=false;


			curCaptured_canv=null;

			document.getElementById("scrawlArea").style.cursor="default";
		}
	}
	else
	{
		var vrt=new Object;
		var brt=jugeIt(curX,curY,vrt,false);

		if (vrt.type==0)
		{







			refreshVertiDisp(false);


		}

	}
}

function processMove(x,y,isTouched)
{
	if (mouseCaptured && curCaptured_canv!=null)
	{
		var cap_verti=curCaptured_canv;

		var deltaX=curX-lastX;
		var deltaY=curY-lastY;

		cap_verti.left+=deltaX;
		cap_verti.top+=deltaY;

		refreshVertiDisp(false);
	}
	else
	{
		var vrt=new Object;
		var brt=jugeIt(curX,curY,vrt,true);

		if (curCaptured_canv!=vrt.verti && curCaptured_canv!=null)
		{

			clearCaluAreaRect(curCaptured_canv);



			refreshVertiDisp(false);
		}

		if (brt==true)
		{
			if (!isTouched)
				putToFrontAndSetfocus(vrt.verti);

			if (vrt.type==1)
			{


				document.getElementById("scrawlArea").style.cursor="default";
			}
			else
			{


				document.getElementById("scrawlArea").style.cursor="pointer";
			}






			refreshVertiDisp(false);
		}
		else
			document.getElementById("scrawlArea").style.cursor="default";
	}

}

function mouseUp()
{
	mouseIsDown = 0;

	mouseXY();


	var e = event;
	e.preventDefault();






	curX=e.offsetX;
	curY=e.offsetY;



	processUp(curX,curY,false);
}

function mouseDown()
{
	var e = event;
	e.preventDefault();




	curX=e.offsetX;
	curY=e.offsetY;



	lastX=curX;
	lastY=curY;

	if (e.button==0)
	{
		mouseIsDown = 1;

		processDown(curX,curY,false);
	}
	else
	if (mouseIsDown==1)
	{
		processUp(curX,curY,false);
	}
}

function onMouseLeave(e)
{
	lastX=lastY=-1;
}

function mouseXY(e)
{



	if (!e) var e = event;

	/*
	var draw=true;

	if (lastX<0 && lastY<0)
		draw=false;
	*/

	lastX=curX;
	lastY=curY;






	curX = e.offsetX;
	curY = e.offsetY ;



	/*


	*/


	{
		processMove(curX,curY,false);
	}
}

function touchUp()
{
	/*
	touches: 当前屏幕上所有触摸点的列表;
	targetTouches: 当前对象上所有触摸点的列表;
	changedTouches: 涉及当前(引发)事件的触摸点的列表

	手指都离开屏幕之后，touches和targetTouches中将不会再有值，changedTouches还会有一个值，
	此值为最后一个离开屏幕的手指的接触点。
	*/

	mouseIsDown = 0;




	var e = event;
	e.preventDefault();

	/*
	手指触摸抬起后，使用touchXY的记录值。
	*/

	processUp(curX,curY,true);
}

function touchDown()
{
	var e = event;


	if(e.targetTouches.length>2)
	{

		processUp(curX,curY,true);
		return;
	}
	else
	if(e.targetTouches.length==1)
	{
		lastX=curX;
		lastY=curY;

		var canvas=document.getElementById("scrawlArea");
		var ob=document.getElementById("canvasArea");

		mouseIsDown = 1;



		var offset=new Object;

		getOffsetXY(offset,canvas);

		curX = e.targetTouches[0].pageX - offset.left;
		curY = e.targetTouches[0].pageY -offset.top + ob.scrollTop;

		processDown(curX,curY,true);

		if (mouseCaptured)
		{
			e.preventDefault();
		}
	}
}

function touchXY(e)
{



	if (!e) var e = event;

	lastX=curX;
	lastY=curY;

	var canvas=document.getElementById("scrawlArea");
	var ob=document.getElementById("canvasArea");

	var offset=new Object;

	getOffsetXY(offset,canvas);

	curX = e.targetTouches[0].pageX - offset.left;
	curY = e.targetTouches[0].pageY - offset.top  + ob.scrollTop;


	if (mouseCaptured)
	{
		e.preventDefault();

		processMove(curX,curY,true);
	}
}

function getOffsetXY(offset,obj)
{
	var left=0;
	var top=0;

	var ob=obj;

	var i=0;

	while (i<5 && ob!=null)
	{
		left+=ob.offsetLeft;
		top+=ob.offsetTop;

		ob=ob.offsetParent;
		i++;
	}

	offset.left=left;
	offset.top=top;
}

function RepairAxis(ctx,w,h,lx,ly)
{
	var ii;


	ctx.strokeStyle="#666666";

	ctx.beginPath();


	for (ii=0;ii<posAxisX.length;ii++)
	{
		ctx.moveTo(lastX-2,posAxisX[ii]);
		ctx.lineTo(lastX+2,posAxisX[ii]);
	}

	ctx.stroke();


	if (glx>=lastX-2 && glx<=lastX+2)
	{
		ctx.strokeStyle="#000000";
		ctx.beginPath();

		ctx.moveTo(glx,h-ly);
		ctx.lineTo(glx,0);
	}
	else
	{
		ctx.strokeStyle="#666666";
		ctx.beginPath();

		for (ii=0;ii<posAxisY.length;ii++)
		{
			if (posAxisY[ii]>=lastX-2 && posAxisY[ii]<=lastX+2)
			{
				ctx.moveTo(posAxisY[ii],h-ly);
				ctx.lineTo(posAxisY[ii],0);
			}
		}
	}

	ctx.stroke();
}

function RepaireCurlv()
{
	var ctx=gctx;
	var c=gcanvas;

	ctx.save();

	ctx.fillStyle="#999999";

	ctx.font="12pt Helvetica";
	ctx.textAlign="left";
	ctx.textBaseline="bottom";

	ctx.clearRect(lastX-2,0,4,gcanvas.height-gly-1);

	var lx,ly;
	lx=glx;ly=gly;

	var rw;
	rw=c.width-50;
	RepairAxis(ctx,rw, c.height,lx,ly);


	var rh=c.height-ly;

	var idx,ii,jj,jjmax;
	var lstX,lstY,crX,crY;

	var dt1,dt2;
	dt1=dStart.split("-");
	dt2=dEnd.split("-");

	var h1,h2;
	h1=hStart;
	h2=hEnd;

	var t1 = new Date(dt1[0],dt1[1]-1,dt1[2],h1,0,0);
	var t2 = new Date(dt2[0],dt2[1]-1,dt2[2],h2,0,0);

	var ms=(t2.getTime()-t1.getTime());

	var h=c.height;
	rw=c.width-50-lx;

	for (idx=0;idx<curlvsDataList.length;idx++)
	{
		if (document.getElementById(curcurlvsTagName[idx]).checked)
		{
			ctx.beginPath();
			ctx.strokeStyle=curCurlvClr[idx];


			jj=startIndex_Grid[idx]-2;
			if (jj<0)
				jj=0;




				crX=curlvsPosList[idx][jj];

			crY=h-ly-rh*curlvsDataList[idx][jj]/curcurlvsMax[idx];

			ctx.moveTo(crX,crY);
			lstX=crX;lstY=crY;
			if (jj+5<=curlvsTMSpanList[idx].length)
				jjmax=jj+5;
			else
				jjmax=curlvsTMSpanList[idx].length;

			for (ii=jj+1;ii<jjmax;ii++)
			{
				crX=curlvsPosList[idx][ii];
				crY=h-ly-rh*curlvsDataList[idx][ii]/curcurlvsMax[idx];

				ctx.lineTo(crX,crY);
				lstX=crX;lstY=crY;
			}
			ctx.stroke();
		}
	}

	ctx.restore();
}

function showPos()
{
	var i;

	if (!traceMouse)
		return;

	if (curlvExisting==0)
		return;

	if (!mouseIsDown)
		return;

	gctx.save();

	if (!firstDraw)
	{
		RepaireCurlv();
	}

	gctx.strokeStyle = "#aaffff";
	gctx.beginPath();

	gctx.moveTo(curX,0);
	gctx.lineTo(curX,gcanvas.height-gly-1);

	gctx.stroke();
	firstDraw=false;


	displayValue(curX);

	gctx.restore();
}


function displayValue(x)
{
	var span=0;
	var idx,ii;

	for (idx=0;idx<curlvsPosList.length;idx++)
	{
		startIndex_Grid[idx]=-1;

		span=0;
		for (ii=1;ii<curlvsPosList[idx].length;ii++)
		{
			if (x<curlvsPosList[idx][ii])
				break;
			else
				span+=Number(curlvsTMSpanList[idx][ii]);
		}

		document.getElementById('vlu_'+curlvsTagName[idx]).innerHTML='<font color='+curFontClr[idx]+'>'+curlvsDataList[idx][ii-1]+'</font>';

		startIndex_Grid[idx]=ii-1;
	}


	var dt1,h1;
	dt1=dStart.split("-");
	h1=hStart;

	var t1 = new Date(dt1[0],dt1[1]-1,dt1[2],h1,0,0);


	var t=new Date(t1.getTime()+span*1000);

	var year=t.getFullYear();
	var month=t.getMonth()+1;
	var day=t.getDate();
	var hour=t.getHours();
	var minute=t.getMinutes();
	var second=t.getSeconds();

	document.getElementById("txtHint").innerHTML=year+"-"+month+"-"+day+" "+hour+":"+minute+":"+second;

}

function drawAxis(ctx,w,h,lx,ly)
{
	var ii;
	var x,y;
	var step=10;
	var stepperX=(w-lx)/step;
	var stepperY=(h-ly)/step


	ctx.fillStyle="#000000";
	ctx.strokeStyle="#000000";


	ctx.beginPath();
	ctx.moveTo(lx,0);
	ctx.lineTo(lx,h-ly);
	ctx.lineTo(w,h-ly);

	for (ii=1;ii<step+1;ii++)
	{
		ctx.moveTo(lx,h-ly-stepperY*ii);
		ctx.lineTo(lx-10,h-ly-stepperY*ii);
		ctx.fillText((ii*10).toString()+"%",5,h-ly-stepperY*ii);
	}

	var dt1,dt2;
	dt1=dStart.split("-");
	dt2=dEnd.split("-");

	var h1,h2;
	h1=hStart;
	h2=hEnd;

	var t1 = new Date(dt1[0],dt1[1]-1,dt1[2],h1,0,0);
	var t2 = new Date(dt2[0],dt2[1]-1,dt2[2],h2,0,0);

	var mseconds=(t2.getTime()-t1.getTime())/10;

	var year;
	var month;
	var day;
	var hour;
	var minute;
	var second;


	var t;

	for (ii=0;ii<step+2;ii++)
	{
		ctx.moveTo(lx+stepperX*ii,h-ly);
		ctx.lineTo(lx+stepperX*ii,h-ly+10);

		t=new Date(t1.getTime()+mseconds*ii);


		year=t.getFullYear();
		month=t.getMonth()+1;
		day=t.getDate();
		hour=t.getHours();
		minute=t.getMinutes();
		second=t.getSeconds();


		ctx.fillText(year+"-"+month+"-"+day,lx+stepperX*ii-20,h-ly+25);
		ctx.fillText(hour+":"+minute+":"+second,lx+stepperX*ii-20,h-ly+30+10);
	}
	ctx.stroke();


	posAxisX=new Array(step);
	posAxisY=new Array(step);

	for (ii=0;ii<step;ii++)
	{
		posAxisX[ii]=-1;
		posAxisY[ii]=-1;
	}

	ctx.strokeStyle="#666666";

	ctx.beginPath();


	for (ii=1;ii<step+1;ii++)
	{
		ctx.moveTo(lx,h-ly-stepperY*ii);
		ctx.lineTo(w,h-ly-stepperY*ii);

		posAxisX[ii-1]=h-ly-stepperY*ii;
	}


	for (ii=1;ii<step+1;ii++)
	{
		ctx.moveTo(lx+stepperX*ii,h-ly);
		ctx.lineTo(lx+stepperX*ii,0);

		posAxisY[ii-1]=lx+stepperX*ii;
	}

	ctx.stroke();
}

function drawCurlv()
{
	var c = document.getElementById("scrawlArea");
	if (!c.getContext) return;


	var ctx = c.getContext("2d");

	ctx.save();

	ctx.fillStyle="#999999";

	ctx.font="12pt Helvetica";
	ctx.textAlign="left";
	ctx.textBaseline="bottom";

	curX=curY=lastX=lastY=-1;

	ctx.clearRect (0,0, c.width, c.height);

	var lx,ly;
	lx=glx;ly=gly;

	var rw;
	rw=c.width-50;
	drawAxis(ctx,rw, c.height,lx,ly);


	var rh=c.height-ly;

	var idx,ii;
	var lastX,lastY,curX,curY;

	/*var t1 = new Date(dStart+" "+hStart+":0:0");
	var t2 = new Date(dEnd+" "+hEnd+":0:0");
	*/
	var dt1,dt2;
	dt1=dStart.split("-");
	dt2=dEnd.split("-");

	var h1,h2;
	h1=hStart;
	h2=hEnd;

	var t1 = new Date(dt1[0],dt1[1]-1,dt1[2],h1,0,0);
	var t2 = new Date(dt2[0],dt2[1]-1,dt2[2],h2,0,0);

	var ms=(t2.getTime()-t1.getTime());

	var h=c.height;
	rw=c.width-50-lx;

	var allspan;

	for (idx=0;idx<curlvsDataList.length;idx++)
	{
		if (document.getElementById(curcurlvsTagName[idx]).checked)
		{
			ctx.beginPath();
			ctx.strokeStyle=curCurlvClr[idx];


			curX=lx;
			curY=h-ly-rh*curlvsDataList[idx][0]/curcurlvsMax[idx];
			ctx.moveTo(curX,curY);
			lastX=curX;lastY=curY;
			curlvsPosList[idx][0]=curX;
			allspan=0;
			for (ii=1;ii<curlvsTMSpanList[idx].length;ii++)
			{
				curX=lx+rw*((allspan+Number(curlvsTMSpanList[idx][ii-1]))*1000)/ms;
				curY=h-ly-rh*curlvsDataList[idx][ii]/curcurlvsMax[idx];

				ctx.lineTo(curX,curY);
				lastX=curX;lastY=curY;
				curlvsPosList[idx][ii]=curX;
				allspan+=Number(curlvsTMSpanList[idx][ii-1]);
			}
			ctx.stroke();
		}
	}









	firstDraw=true;

	ctx.restore();
}



function changelineColor(v)
{

	g_lineColor="#"+v;
}




function createchufa(withoutResult)
{
	copyArr(pre_factor2,cur_pre);

	if (pre_factor2.length<=0 || pre_factor1.length<=0)
		return;

	f_beichushu=pre_factor1.join("");
	f_chushu=pre_factor2.join("");

	if (Number(f_chushu)==0)
	{
		document.getElementById("infotip").innerHTML="除数为0！";
		return;
	}




	bkbkbkook=withoutResult;


	drawDivide(withoutResult);


}

function drawStruct(ctx,startX,startY,endX)
{
	ctx.beginPath();

	var w=ctx.lineWidth;
	ctx.lineWidth=3;

	ctx.moveTo(startX-1,startY);
	ctx.lineTo(endX,startY);


	ctx.moveTo(startX,startY);


	var r=fontsize*3;
	ctx.arc(startX-r, startY,r,0.05*Math.PI,0.25*Math.PI);



	ctx.lineWidth=w;
	ctx.stroke();
}

function existNonZero(num,pos)
{
	var i;
	for (i=pos;i<num.length;i++)
		if (num.substr(i,1)!="0")
			break;

	if (i<num.length)
		return true;
	else
		return false;
}

function CheckInYushu(arr,num,dot_pos)
{

	var i;
	for (i=dot_pos;i<arr.length;i++)
	{
		if (arr[i].v==num)
			break;
	}

	if (i<arr.length)
		return arr[i].pos;
	else
		return -1;
}


function processDiv(v1,v2)
{
	var res;
	var i;
	var s1=v1.toString();
	var s2=v2.toString();
	var pos1=s1.indexOf(".");
	var pos2=s2.indexOf(".");
	if (pos1<0 && pos2<0)
	{
		res=v1/v2;
	}
	else
	if (pos1<0)
	{
		var fact=s2.length-pos2-1;



		var sn=s2.substr(0,pos2)+s2.substr(pos2+1,fact);

		for (i=0;i<fact;i++)
			s1+="0";



		res=s1/sn;
	}
	else
	if(pos2<0)
	{
		var fact=s1.length-pos1-1;

		var sn=s1.substr(0,pos1)+s1.substr(pos1+1,fact);

		for (i=0;i<fact;i++)
			s2+="0";

		res=sn/s2;
	}
	else
	{


		var fact1=s1.length-pos1-1;
		var fact2=s2.length-pos2-1;

		var sn1=s1.substr(0,pos1)+s1.substr(pos1+1,fact1);
		var sn2=s2.substr(0,pos2)+s2.substr(pos2+1,fact2);
		if (fact1<fact2)
		{
			for (i=0;i<fact2-fact1;i++)
				sn1+="0";
		}
		else
		if (fact1>fact2)
		{
			for (i=0;i<fact1-fact2;i++)
				sn2+="0";
		}

		res=sn1/sn2;
	}


	s=res.toString();
	pos=s.indexOf(".");
	if (pos<0)
		return s;
	else
	{
		i=pos+6;
		while (i>pos && s.charAt(i)=="0")
			i--;
		s=s.substr(0,pos+i);


		return s;
	}
}


function processDiv_a(v1,v2)
{
	var res;
	var i;
	var s=v2.toString()
	var pos=s.indexOf(".");
	if (pos<0)
	{
		res=v1/v2;


	}
	else
	{
		var fact=s.length-pos-1;



		var s2=s.substr(0,pos)+s.substr(pos+1,fact);

		var s1=v1.toString();
		pos=s1.indexOf(".");
		if (pos>=0)
		{
			var len=s1.length-pos-1;
			for (i=0;i<fact-len;i++)
				s1+="0";
			s1=s1.substr(0,pos)+s1.substr(pos+1,s1.length-pos-1);

			pos+=fact;

			s1=s1.substr(0,pos)+"."+s1.substr(pos,s1.length-pos);
		}
		else
		{
			for (i=0;i<fact;i++)
				s1+="0";
		}




		res=s1/s2;
	}


	s=res.toString();
	pos=s.indexOf(".");
	if (pos<0)
		return s;
	else
	{
		i=pos+6;
		while (i>pos && s.charAt(i)=="0")
			i--;
		s=s.substr(0,pos+i);


		return s;
	}
}

function processBeichushu(fact,beichushu)
{
	var k;

	var s_beichushu=beichushu;

	var num_fact=0;
	/*var s_fact=fact.toString();

	for (k=s_fact.length-1;k>=0;k--)
	{
		if (s_fact.substr(k,1)=="0")
			num_fact++;
		else
			break;
	}*/

	num_fact=fact;

	if (num_fact>0)
	{
		var subs;
		k=beichushu.indexOf(".");
		if (k>=0)
		{
			j=beichushu.length-k-1;
			if (j==num_fact)
				s_beichushu=beichushu;
			else
			if (j>num_fact)
			{
				subs=beichushu.substr(0,k+1+num_fact);
				s=beichushu.substr(k+1+num_fact,beichushu.length-k+1+num_fact);

				s_beichushu=subs+"."+s;

			}
			else
			{
				s_beichushu=beichushu;
				j=num_fact-beichushu.length+k+1;

				for (k=0;k<j;k++)
					s_beichushu+="0";
			}
		}
		else
		{
			for (k=0;k<num_fact;k++)
					s_beichushu+="0";


		}
	}


	return s_beichushu;
}

function trimLeftZero(s)
{
	var i,k;
	i=s.indexOf(".");

	if (i<0)
	{
		k=0;
		while (k<s.length && s.charAt(k)=='0')   k++;

		if (k>0)
			s=s.substr(k,s.length-k);
	}
	else
	{

		if (i==0)
			s="0"+s;
		else
		{
			k=0;
			while (k<i-1 && s.charAt(k)=='0')   k++;

			if (k>0)
				s=s.substr(k,s.length-k);
		}


		i=s.indexOf(".");

		if (s.length-1==i)
		{
			s=s.substr(0,s.length-1);;
		}
		else
		{
			k=s.length-1;
			while (k>i && s.charAt(k)=='0')   k--;

			if (k<s.length-1)
			{
				if (k==i)
					s=s.substr(0,k);
				else
					s=s.substr(0,k+1);


			}
		}
	}

	return s;
}

function trimZero(s)
{
	var i,k;
	i=s.indexOf(".");

	if (i<0)
	{
		k=0;
		while (k<s.length && s.charAt(k)=='0')   k++;

		if (k>0)
			s=s.substr(k,s.length-k);
	}
	else
	{

		if (i==0)
			s="0"+s;
		else
		{
			k=0;
			while (k<i-1 && s.charAt(k)=='0')   k++;

			if (k>0)
				s=s.substr(k,s.length-k);
		}


		i=s.indexOf(".");

		if (s.length-1==i)
		{
			s=s.substr(0,s.length-1);;
		}
		else
		{
			k=s.length-1;
			while (k>i && s.charAt(k)=='0')   k--;

			if (k<s.length-1)
			{
				if (k==i)
					s=s.substr(0,k);
				else
					s=s.substr(0,k+1);


			}
		}
	}


	return s;
}

function checkPoint(s,j)
{
	var i;

	if (j>=s.length)
		j=s.length-1;

	for (i=0;i<=j;i++)
		if (s.charAt(i)=='.')
			break;

	if (i<=j)
		return true;
	else
		return false;
}

/*
s_chushu为已经扩展了倍数的，已经变为了整数
*/
function prepareBCS(org_chushu,s_chushu,s_beichushu)
{
	var s_bcs=s_beichushu;
	var bcs;
	while (1)
	{
		bcs="";

		var i=0;
		var s;
		while (i<s_bcs.length)
		{
			s=s_bcs.substr(i,1);
			if (s!='.')
				bcs+=s;

			i++;
		}

		if (parseInt(s_chushu)>parseInt(bcs))
		{
			if (s_bcs.indexOf(".")<0
				|| s_bcs.indexOf(".")>=0 && org_chushu.indexOf(".")>=0)
				s_bcs+=".";

			s_bcs+="0";
		}
		else
			break;
	}

	return s_bcs;
}

function findFirsti(i,org_chushu,s_chushu,s_beichushu)
{
	var new_i=i;

	var s_bcs=s_beichushu;
	var bcs;
	while (1)
	{
		bcs="";

		var j=0;
		var s;
		while (j<new_i)
		{
			s=s_bcs.substr(j,1);
			if (s!='.')
				bcs+=s;

			j++;
		}

		if (parseInt(s_chushu)>parseInt(bcs))
		{
			if (new_i<s_beichushu.length)
				new_i++;
			else
				break;
		}
		else
			break;
	}

	return new_i;
}

function drawDivide(verti_idx)
{
	var c=gVerti[verti_idx].canv;

	var gfactor1=gVerti[verti_idx].pm1;
	var gfactor2=gVerti[verti_idx].pm2;
	var gproduct=new Array();

	var i;
	var k;
	var j;
	var s;

	var first_dot_bcs=-1;

	var dot_pos=-1;

	var bShouldCrash_Beichushu=false;
	var bShouldCrash_Chushu=false;

	var isZhengshu;

	var gap;
	var dotclear_per=4;

	gap=g_gap;

	/*if (IsItMobile())
	{
		dotclear_per=-16;







	}*/









	f_beichushu=gfactor1.join("");
	f_chushu=gfactor2.join("");

	f_beichushu=trimZero(f_beichushu);
	f_chushu=trimZero(f_chushu);

	if (Number(f_chushu)==0)
	{
		document.getElementById("infotip").innerHTML="除数为0！";
		return;
	}

	if (f_beichushu.indexOf(".")<0 && f_chushu.indexOf(".")<0)
		isZhengshu=true;
	else
		isZhengshu=false;





	f_shang=processDiv(f_beichushu,f_chushu);



	var f_n_chushu,f_n_beichushu;

	 f_n_chushu=f_chushu;
	chushu=f_n_chushu.toString();




	var s_chushu,s_beichushu,s_shang;

	var s_fact="1";
	s_chushu=chushu;




	/*while (s_chushu.indexOf(".")>=0)
	{
		fact*=10;
		f_n_chushu=10* f_n_chushu;
		s_chushu=f_n_chushu.toString();


	}*/

	k=s_chushu.indexOf(".");
	if (k>=0)
	{
		j=s_chushu.length-k-1;
		s_chushu=s_chushu.substr(0,k)+s_chushu.substr(k+1,j);


	}
	else
		j=0;



	var fact=j;







	k=0;
	while (s_chushu.charAt(k)=='0')
		k++;

	if (k>0)
		s_chushu=s_chushu.substr(k,s_chushu.length-k+1);

	f_n_chushu=parseInt(s_chushu);





	s_beichushu=f_beichushu.toString();

	if (s_beichushu.indexOf(".")<0)
	{
		k=fact;

		while (k>0)
		{
			s_beichushu+="0";
			k--;
		}
	}
	else
	{
		k=s_beichushu.indexOf(".");
		s_beichushu=s_beichushu.substr(0,k)+s_beichushu.substr(k+1,s_beichushu.length-k-1);

		s_beichushu=s_beichushu.substr(0,k+fact)+"."+s_beichushu.substr(k+fact,s_beichushu.length-k-fact);

		if (s_beichushu.charAt(s_beichushu.length-1)=='.')
			s_beichushu+="0";



		k=0;
		while (k<s_beichushu.length && s_beichushu.charAt(k)=='0')
			k++;

		if (k>0 && k<s_beichushu.length)
		{
			if (s_beichushu.charAt(k)=='.')
				k--;

			s_beichushu=s_beichushu.substr(k,s_beichushu.length-k+1);


		}
	}





	beichushu=f_beichushu.toString();

	var orig_beichushu=beichushu;



	shang=f_shang.toString();

	pos_of_point=shang.indexOf(".");



	var pos_i=shang.indexOf(".");
	if (pos_i<0)
		s_shang=shang;
	else
	{

		s_shang=shang.substr(0,pos_i) + shang.substr(pos_i+1,shang.length-1-pos_i)  ;
	}

	/*
	处理一开始不够除就需要补零的情况，根据商的零的个数对被除数进行补充
	*/
	var num_zero=0;
	k=0;


	while (k<shang.length)
	{
		s=shang.substr(k,1)
		if (s=="0" || s==".")
		{
			if (s=="0")
				num_zero++;

			k++;
		}
		else
			break;

	}



	/*k=0;
	var b_num_zero=0;
	var existsDot=false;
	while (k<s_beichushu.length)
	{
		s=s_beichushu.substr(k,1)
		if (s=="0" || s==".")
		{
			if (s=="0")
				b_num_zero++;
			else
				existsDot=true;

			k++;
		}
		else
			break;

	}*/



	b_num_zero=s_beichushu.indexOf(".");
	if (b_num_zero>0)
	{
		k=s_beichushu.length-1;
		while (k>b_num_zero)
		{
			if (s_beichushu.charAt(k)!='0')
				break;

			k--;
		}

		if (k==b_num_zero)
			b_num_zero=0;
	}
	else
	if (b_num_zero<0)
		b_num_zero=0;


	b_num_zero=num_zero-b_num_zero;




	if (b_num_zero>0)
	{

		if (beichushu.indexOf(".")<0)
		{
			beichushu=beichushu + ".0";


			b_num_zero--;
		}


		k=0;
		while (k<s_shang.length && (s_shang.charAt(k)=='0' ))
		{
			k++;
		}


		s=s_shang.substr(k,1);


		var s_b=beichushu.toString();
		k=s_b.indexOf(".");
		s_b=s_b.substr(0,k)+s_b.substr(k+1,s_b.length-k-1);


		k=0;
		while (k<s_b.length && s_b.charAt(k)=='0')
		{
			k++;
		}

		ss=s_b.substr(k,s_chushu.length);










		{
		while (b_num_zero>0)
		{
			b_num_zero--;

			beichushu=beichushu+ "0";
		}
		}

	}




	s_beichushu=processBeichushu(fact,beichushu);



	s_beichushu=prepareBCS(chushu,s_chushu,s_beichushu);



	first_dot_bcs=s_beichushu.indexOf(".")+fact;










	/*
	arrChushu.splice(0,arrChushu.length);

	arrChushuX=new Array(chushu.length);
	arrChushuY=new Array(chushu.length);

	arrBeiChushu.splice(0,arrBeiChushu.length);

	arrBeiChushuX=new Array(beichushu.length);
	arrBeiChushuY=new Array(beichushu.length);

	arrShang.splice(0,arrShang.length);

	arrShangX=new Array(shang.length);
	arrShangY=new Array(shang.length);



	arrAmonRlt.splice(0,arrAmonRlt.length);

	arrAmonRltX=new Array();
	arrAmonRltY=new Array();


	arrYushu.splice(0,arrYushu.length);

	arrYushuPos.splice(0,arrYushuPos.length);


	arrYushuList=new Array();
	arrYushuPos=new Array();
	*/

	var maxRight=-1,maxBottom=-1;

	var vnLeft,vnRight;






	var o_yushu = new Object();


	var ctx = c.getContext("2d");

	ctx.save();

	ctx.fillStyle=g_fontstyle;
	ctx.lineWidth=2;

	ctx.font=fontsize+ "pt Times New Roman";
	ctx.textAlign="left";
	ctx.textBaseline="bottom";


	if (gVerti[verti_idx].blankFormula)
	{
		drawDivideWithoutCal(verti_idx,f_beichushu,f_chushu);

		return;
	}

	var arrChushu=new Array();
	var arrBeiChushu=new Array();
	var arrAmonRlt=new Array();
	var arrFormula=new Array();
	var arrShang=new Array();

	var arrYushu=new Array();
	var arrYushuPos=new Array();


	var x,y;
	x=200;
	y=50;

	var leftisoutof=0;

	var retry=2;
	while (retry>0)
	{

	ctx.clearRect (0,0, c.width, c.height);



	k=shang.indexOf(".");
	if (k>=0)
	{
		k+=3;
	}
	else
		k=shang.length;

	var hdlen=(k-1)*gap+ctx.measureText("0").width*k;
	var startX,startY;



	startX=50+(f_chushu.length+1)*gap;




	/*if (IsItMobile())
		startY=200;
	else*/
		startY=100;


	startX/=nScaleMulti;


	startX=startX-leftisoutof;



	lineHeight=fontsize*3/2;





	ctx.beginPath();

	var whh,sst;

	var dotshouldcleared=false;


	var num_start_pos=0;
	if (chushu.indexOf(".")>=0)
	{
		while (num_start_pos < chushu.length
			&& (chushu.charAt(num_start_pos)=='0' ||  chushu.charAt(num_start_pos)=='.'))
			num_start_pos++;
	}

	var crash=false;
	x=startX-gap-5;
	y=startY+gap/2+fontsize;

	for (i=chushu.length-1;i>=0;i--)
	{
		crash=false;

		s=chushu.substr(i,1);

		ctx.fillText(s,x,y);

		if (s==".")
		{
			pos_of_Chushu_org_dotX=x;
			pos_of_Chushu_org_dotY=y;

			bShouldCrash_Chushu=true;


			whh=ctx.lineWidth;
			sst=ctx.strokeStyle;

			ctx.lineWidth=1;

			ctx.strokeStyle="#ff0000";

			ctx.moveTo(x+fontsize/10,y-fontsize/2);
			ctx.lineTo(x+fontsize/3,y-fontsize/dotclear_per);

			ctx.lineWidth=whh;
			ctx.strokeStyle=sst;

			dotshouldcleared=true;

			crash=true;


		}
		else
		if (i<num_start_pos && s=="0")
		{
			whh=ctx.lineWidth;
			ctx.lineWidth=1;
			sst=ctx.strokeStyle;

			ctx.strokeStyle="#ff0000";

			ctx.moveTo(x,y-fontsize);
			ctx.lineTo(x+2*fontsize/3,y-fontsize/3);

			ctx.lineWidth=whh;
			ctx.strokeStyle=sst;

			crash=true;
		}

		arrChushu.push({"X":x,"Y":y,"V":s,"visible":true,"crash":crash});




		if (chushu.substr(i,1)=="." )
			x-=gap*2/3;
		else
		if (chushu.substr(i-1,1)==".")
			x-=gap-gap*2/3;
		else
			x-=gap;

	}

		if (x<0)
		{
			leftisoutof=x;
			retry--;
		}
		else
			retry=0;
	}



	num_start_pos=0;
	k=s_beichushu.indexOf(".");
	if (k>=0)
	{

		while (num_start_pos < s_beichushu.length
			&& (s_beichushu.charAt(num_start_pos)=='0' ||  s_beichushu.charAt(num_start_pos)=='.'))
			num_start_pos++;


		i=s_beichushu.length-1;
		while (i>=0
			&& s_beichushu.charAt(i)!='.')
			i--;

		if (k!=i && i<num_start_pos)
			num_start_pos=i-1;
		else
		if (fact<=0)
			num_start_pos=-1;
	}

	x=startX+gap/2;
	y=startY+gap/2+fontsize;
	var cleared=false;
	for (i=0;i<s_beichushu.length;i++)
	{
		crash=false;

		s=s_beichushu.substr(i,1);

		ctx.fillText(s,x,y);



		if (s=="." )
		{
			if (i==first_dot_bcs)
			{
				pos_of_Beichushu_org_dotX=x;
				pos_of_Beichushu_org_dotY=y;

				bShouldCrash_Beichushu=true;
			}
			else
			if (cleared==false && dotshouldcleared)
			{

				whh=ctx.lineWidth;
				sst=ctx.strokeStyle;

				ctx.lineWidth=1;

				ctx.strokeStyle="#ff0000";

				ctx.moveTo(x+fontsize/10,y-fontsize/2);
				ctx.lineTo(x+fontsize/3,y-fontsize/dotclear_per);

				ctx.lineWidth=whh;
				ctx.strokeStyle=sst;


				cleared=true;

				crash=true;
			}

		}
		else
		if (i<num_start_pos && s=="0")
		{
			whh=ctx.lineWidth;
			ctx.lineWidth=1;
			sst=ctx.strokeStyle;

			ctx.strokeStyle="#ff0000";

			ctx.moveTo(x,y-fontsize);
			ctx.lineTo(x+2*fontsize/3,y-fontsize/3);

			ctx.lineWidth=whh;
			ctx.strokeStyle=sst;

			crash=true;
		}

		arrBeiChushu.push({"X":x,"Y":y,"V":s,"visible":true,"crash":crash});

		if (s_beichushu.substr(i+1,1)==".")
			x+=gap*2/3;
		else
		if ( s_beichushu.substr(i,1)==".")
			x+=gap-gap*2/3;
		else
			x+=gap;

	}

	var drawed_bchushu=s_beichushu;

	var ss;
	var f_v,s_v;

	var pos_shg=0;


	while (s_shang.charAt(pos_shg)=='0' )
	{

			pos_shg++;



	}







	i=s_chushu.length;

	i=findFirsti(i,chushu,s_chushu,s_beichushu)



	var s_beichushu_sub="";


	j=0;
	/*
	if(i<s_beichushu.length)
	{
		while (j<s_beichushu.length && (s_beichushu.charAt(j)=='0' || s_beichushu.charAt(j)=='.'))
			j++;
	}*/

	if (s_beichushu.charAt(j+i-1)=='.')
		i++;



	if (i>s_beichushu.length)
	{

		if (s_beichushu.indexOf(".")>=0)
			s_beichushu+="0";
		else
		{
			s_beichushu+=".0";
			i++;
		}
	}

	s_v="";

	k=j;

	while (k<j+i)
	{
		ss=s_beichushu.substr(k,1);
		if (ss!=".")
		{
			s_v+=ss;
		}

		k++;
	}

	s_beichushu_sub=s_v;

	f_v=parseInt(s_v);



	if (f_v<f_n_chushu*parseInt(s_shang.substr(pos_shg,1)))
	{
		ss=s_beichushu.substr(k,1);
		i++;
		if (ss==".")
		{
			ss=s_beichushu.substr(k+1,1);
			i++;
		}

		s_beichushu_sub+=ss;
	}



	i=j+i-1;








	var ks;
	var kx,ky;
	var start_pos_kX,start_pos_kY;
	start_pos_kX=arrBeiChushu[0].X;
	start_pos_kY=arrBeiChushu[0].Y+lineHeight;

	shang_disp="";

	var vn;
	var needProcess=true;
	var l=0;

	var m;
	m=0;

	dot_pos=-1;

	y=startY;

	if (pos_shg>0)
	{
		if (s_beichushu.charAt(i-1)=='.')
		{

			if (shang.substr(pos_shg,1)=='.')
				x=arrBeiChushu[i-1].X;
			else
			if (i-2>=0)
				x=arrBeiChushu[i-2].X;
			else
				x=arrBeiChushu[0].X;
		}
		else
			x=arrBeiChushu[i-1].X;





		if (pos_shg>0)
		{
			m=pos_shg;




			while (m>=0)
			{
				s=shang.substr(m,1);


				ctx.fillText(s,x,y);

				arrShang.push({"X":x,"Y":y,"V":s,"visible":true});



				if (s==".")
				{
					dot_pos=m-1;
				}

				shang_disp=s+shang_disp;

				if (shang.substr(m,1)=="." )
					x-=gap*2/3;
				else
				if (shang.substr(m-1,1)==".")
					x-=gap-gap*2/3;
				else
					x-=gap;

				m--;
			}

			m=pos_shg+1;
		}
	}





	var start_pos_shg=pos_shg;



	if (drawed_bchushu.charAt(i)=='.')
	{

		if (i-1>=0)
			x=arrBeiChushu[i-1].X;
		else
			x=arrBeiChushu[0].X;
	}
	else
	{

		x=arrBeiChushu[i].X;
		/*if (j+i-1>=0 && j+i-1<drawed_bchushu.length)
		{

			x=arrBeiChushu[j+i-1].X;
		}
		else
		if (j+i-1>=drawed_bchushu.length)
		{
			if (drawed_bchushu.charAt(drawed_bchushu.length-1)=='.')
				x=arrBeiChushu[drawed_bchushu.length-1].X+gap*1/3;
			else
				x=arrBeiChushu[drawed_bchushu.length-1].X;
		}
		else
			x=arrBeiChushu[0].X;

		*/
	}

	j=m;

	vnLeft="";
	vnRight="";
	var pos_vnLeft=-1;

	var kxStart,kyStart;


	cir_start=cir_end=-1;

	var hasMore=false;

	var cur_char_shange;

	yuShu="";

	var vn_per=0;


	i++;
	var posY_n=start_pos_kY;
	for (;j<shang.length;j++)
	{
		s=shang.substr(j,1);

		if (j+1<shang.length)
			cur_char_shange=shang.substr(j+1,1);
		else
			cur_char_shange="";




		ctx.fillText(s,x,y);

		arrShang.push({"X":x,"Y":y,"V":s,"visible":true});
		arrAmonRlt.push({"X":x,"Y":y,"V":s,"visible":true});

		shang_disp+=s;




		if (shang.substr(j+1,1)=="." )
			x+=gap*2/3;
		else
		if (shang.substr(j,1)==".")
			x+=gap-gap*2/3;
		else
			x+=gap;

		if (s==".")
		{

			dot_pos=pos_shg-1;
		}

		if (s!="." && pos_shg<=j )
		{
			if (vnRight=="")
			{
				s=s_shang.substr(pos_shg,1);

				f_v=f_n_chushu*parseInt(s);
				s_v=f_v.toString();

				if (f_v!=0)
				{

					kx=arrShang[j].X;

					ky=posY_n;



					for (k=s_v.length-1;k>=0;k--)
					{
						ks=s_v.substr(k,1);

						ctx.fillText(ks,kx,ky);

						arrAmonRlt.push({"X":kx,"Y":ky,"V":ks,"visible":true});



						kx-=gap;
					}

				}



				vn=parseInt(s_beichushu_sub)-parseInt(s)*f_n_chushu;
				s_beichushu_sub=vn.toString();

				vnLeft=vn.toString();

				pos_vnLeft=arrShang[j].X;





			}



				if (cur_char_shange=="." && isZhengshu==true)
				{

					if (vnRight=="")
						yuShu=vnLeft;
					else
					{
						yuShu=vnRight;

						if (vnLeft=="")
						{
							yuShu=trimZero(yuShu);
							vnRight=yuShu;
						}
						else
							yuShu=vnLeft+vnRight;
					}

				}
				else
				if (i<s_beichushu.length)
				{
					ss=s_beichushu.substr(i,1);
					i++;
					if (ss==".")
					{
						ss=s_beichushu.substr(i,1);
						i++;
					}






					vnRight+=ss;

					if (vnLeft=="0")
					{
						vnLeft="";
						vn_per=0;
					}

					s_beichushu_sub=vnLeft+vnRight;


				}
				else
				{



					if (!((vnLeft=="" || vnLeft=="0") && (vnRight=="0" || vnRight=="")))
					{

						vnRight+="0";

						if (vnLeft=="0")
						{
							vnLeft="";
							vn_per=1;
						}

						s_beichushu_sub=vnLeft+vnRight;


					}
				}




				if (parseInt(vnRight)>0 ||
					i>s_beichushu.length ||

					i==s_beichushu.length && vnLeft=="" && vnRight!="0")
					vnRight=trimLeftZero(vnRight);










				if (s_shang.charAt(pos_shg+1)!="0" || cur_char_shange=="." && isZhengshu==true)
				{
					/*

					kx=start_pos_kX+gap*pos_shg;

					ky=posY_n;


					ctx.moveTo(kx-gap/2,ky);

					ctx.lineTo(arrShang[j].X+ctx.measureText(s_beichushu_sub+"0").width+gap*(s_beichushu_sub.length-1),
											ky);
					*/







					if (j-vn_per<0)
						vn_per=0;

					if (vnRight.length>0)
					{
						if (j-vnRight.length+1-vn_per>=0)
							kx=arrShang[j-vnRight.length+1-vn_per].X;
						else
							kx=arrShang[0].X;
					}
					else
					{
						kx=arrShang[j-vn_per].X;
					}


					ky=posY_n+lineHeight;

					kxStart=kx;
					var kx_forvnRightStart=kx;



					for (k=vnLeft.length-1;k>=0;k--)
					{
						ks=vnLeft.substr(k,1);

						ctx.fillText(ks,kx,ky);

						arrAmonRlt.push({"X":kx,"Y":ky,"V":ks,"visible":true});



						kx-=gap;
					}


					kx=start_pos_kX+gap*pos_shg;

					ky=posY_n;


					kxStart=kx-(s_v.length-1)*gap;
					ctx.moveTo(kx-gap,ky);
					ctx.lineTo(kxStart,ky);

					/*判断是否循环小数
						只能判断商的小数点之后的余数.........待完善
					*/
					var ik=-1;
					if (dot_pos>=0)
						ik=CheckInYushu(arrYushu,s_beichushu_sub,dot_pos)



					var vnRight_not_display=false;
					if (pos_of_point>=0 && j>pos_of_point && ik>=0)
					{

						cir_start=ik;
						cir_end=j;

						vnRight_not_display=true;




					}
					else
					if (pos_of_point>=0 && j-pos_of_point>=7)
					{


						vnRight_not_display=true;
					}

					if (!(vnLeft=="0" && vnRight=="0") )

					{


						if (vnRight.length>1)
						{

							if (vnLeft=="")
								kx=arrShang[j-vnRight.length+2-vn_per].X;
							else
								kx=arrShang[j-vnRight.length+2-vn_per].X;
						}
						else
						{

							kx=arrShang[j-vn_per].X;


							/*if (isZhengshu==true)
							{





								if (i<s_beichushu.length ||
									i==s_beichushu.length && (parseInt(vnRight)>=f_n_chushu || vnLeft!=""))
								{
									kx+=gap;
								}
							}
							else
								kx+=gap;*/

							if (i<s_beichushu.length ||
									i==s_beichushu.length && (parseInt(vnRight)>=f_n_chushu || vnLeft!=""))
								{
									kx+=gap;
								}
						}

						if (vnLeft!="")
							kx=kx_forvnRightStart+gap;

						ky=posY_n+lineHeight;

						if (ky>maxBottom)
							maxBottom=ky;


						for (k=0;k<vnRight.length;k++)
						{
							if (vnRight_not_display==false)
							{
								ks=vnRight.substr(k,1);

								ctx.fillText(ks,kx,ky);





								arrAmonRlt.push({"X":kx,"Y":ky,"V":ks,"visible":true});
							}




							kx+=gap;
						}


						ctx.moveTo(kxStart,posY_n);
						ctx.lineTo(kx,posY_n);
					}

					/*
						判断是否循环小数
						×
					*/



					if (pos_of_point>=0 && j>pos_of_point && ik>=0)
					{
						/*

						cir_start=arrYushu[ik].pos;
						cir_end=j;


						*/
						break;
					}
					else
					if (pos_of_point>=0 && j-pos_of_point>=7)
					{


						hasMore=true;
						break;
					}
					else
					{
						arrYushu.push({"pos":j,"v":s_beichushu_sub});



					}


					vnLeft="";
					vnRight="";
					pos_vnLeft=-1;

					vn_per=0;

					posY_n+=lineHeight*2;

					if (f_v!=0)
						l=0;
				}

				pos_shg++;

				if (y>maxBottom)
					maxBottom=y;

				if (ky>maxBottom)
					maxBottom=ky;
		}

		if(vnLeft.length>0)
			vn_per=1;
		else
			vn_per=0;

		if (cur_char_shange=="." && isZhengshu==true)
		{

			break;
		}
	}


	ctx.stroke();




	drawStruct(ctx,startX,startY,
			arrShang[arrShang.length-1].X+gap);





	var dis_beichushu=f_beichushu;
	var dis_chushu=f_chushu;
	var dis_shang= shang_disp;

	kx=arrChushu[arrChushu.length-1].X;

	/*if (IsItMobile())
		ky=100;
	else*/
		ky=50;



	for (k=0;k<dis_beichushu.length;k++)
	{
		ks=dis_beichushu.substr(k,1);

		ctx.fillText(ks,kx,ky);

		arrFormula.push({"X":kx,"Y":ky,"V":ks,"visible":true});

		if (k<dis_beichushu.length && dis_beichushu.substr(k+1,1)==".")
			kx+=gap*2/3;
		else
		if (dis_beichushu.substr(k,1)==".")
			kx+=gap-gap*2/3;
		else
			kx+=gap;
	}

	ks="÷";
	ctx.fillText(ks,kx,ky);
	kx+=gap;

	for (k=0;k<dis_chushu.length;k++)
	{
		ks=dis_chushu.substr(k,1);

		ctx.fillText(ks,kx,ky);

		arrFormula.push({"X":kx,"Y":ky,"V":ks,"visible":true});

		if (k<dis_chushu.length && dis_chushu.substr(k+1,1)==".")
			kx+=gap*2/3;
		else
		if (dis_chushu.substr(k,1)==".")
			kx+=gap-gap*2/3;
		else
			kx+=gap;
	}

	ks="=";
	ctx.fillText(ks,kx,ky);
	kx+=gap;

	if (kx>maxRight)
		maxRight=kx;

	if (!gVerti[verti_idx].blankFormula)
	{
		for (k=0;k<dis_shang.length;k++)
		{
			ks=dis_shang.substr(k,1);

			ctx.fillText(ks,kx,ky);

			if (cir_start!=cir_end && cir_start+1==k || cir_end==k)
			{

				var cx;
				if (ks==".")
					cx=kx+gap/2;
				else
					cx=kx+gap/4;

				var cy=ky-lineHeight*4/5;

				ctx.fillText(".",cx,cy);
			}

			arrFormula.push({"X":kx,"Y":ky,"V":ks,"visible":true});

			if (k<dis_shang.length && dis_shang.substr(k+1,1)==".")
				kx+=gap*2/3;
			else
			if (dis_shang.substr(k,1)==".")
				kx+=gap-gap*2/3;
			else
				kx+=gap;

			if (kx>maxRight)
				maxRight=kx;
		}

		if (isZhengshu==true)
		{
			if (yuShu!="")
			{
				ctx.fillText("......",kx,ky-lineHeight/5);

				kx+=gap*3/2+gap;

				for (k=0;k<yuShu.length;k++)
				{
					ks=yuShu.substr(k,1);
					ctx.fillText(ks,kx,ky);

					arrYushuPos.push({"X":kx,"Y":ky,"V":ks,"visible":true});

					kx+=gap;
				}

				if (kx>maxRight)
					maxRight=kx;
			}
		}
		else
		if (dis_shang!="" && hasMore)
		{
			ctx.fillText("......",kx,ky-lineHeight/5);
		}
	}

	ctx.restore();

	var nc = document.createElement("canvas");
	nc.width = c.width;
	nc.height = c.height;
	nc.getContext("2d").drawImage(c,0,0);

	c.width=maxRight+gap;
	c.height=maxBottom+3*gap;

	gVerti[verti_idx].w=c.width;
	gVerti[verti_idx].h=c.height;

	ctx.drawImage(nc,0,0);

	gArrPoints.push({"verti":gVerti[verti_idx],"idx":verti_idx,"arrFactor1":arrChushu,"arrFactor2":arrBeiChushu,"arrAmonRlt":arrAmonRlt,"arrFormula":arrFormula});
}

function displayFormula(verti_idx,ctx,startX,dis_beichushu,dis_chushu,dis_shang)
{
	var c=gVerti[verti_idx].canv;




	var gap=g_gap;

	var k,ks,kx,ky;

	kx=arrChushu[arrChushu.length-1].X;

	/*if (IsItMobile())
		ky=100;
	else*/
		ky=50;



	for (k=0;k<dis_beichushu.length;k++)
	{
		ks=dis_beichushu.substr(k,1);

		ctx.fillText(ks,kx,ky);

		arrFormula.push({"X":kx,"Y":ky,"V":ks,"visible":true});

		if (k<dis_beichushu.length && dis_beichushu.substr(k+1,1)==".")
			kx+=gap*2/3;
		else
		if (dis_beichushu.substr(k,1)==".")
			kx+=gap-gap*2/3;
		else
			kx+=gap;
	}

	ks="×";
	ctx.fillText(ks,kx,ky);
	kx+=gap;

	for (k=0;k<dis_chushu.length;k++)
	{
		ks=dis_chushu.substr(k,1);

		ctx.fillText(ks,kx,ky);

		arrFormula.push({"X":kx,"Y":ky,"V":ks,"visible":true});

		if (k<dis_chushu.length && dis_chushu.substr(k+1,1)==".")
			kx+=gap*2/3;
		else
		if (dis_chushu.substr(k,1)==".")
			kx+=gap-gap*2/3;
		else
			kx+=gap;
	}

	ks="=";
	ctx.fillText(ks,kx,ky);
	kx+=gap;

	for (k=0;k<dis_shang.length;k++)
	{
		ks=dis_shang.substr(k,1);

		ctx.fillText(ks,kx,ky);

		if (cir_start!=cir_end && cir_start+1==k || cir_end==k)
		{

			var cx;
			if (ks==".")
				cx=kx+gap/2;
			else
				cx=kx+gap/4;

			var cy=ky-lineHeight*4/5;

			ctx.fillText(".",cx,cy);
		}

		arrFormula.push({"X":kx,"Y":ky,"V":ks,"visible":true});

		if (k<dis_shang.length && dis_shang.substr(k+1,1)==".")
			kx+=gap*2/3;
		else
		if (dis_shang.substr(k,1)==".")
			kx+=gap-gap*2/3;
		else
			kx+=gap;
	}

	if (!gVerti[verti_idx].blankFormula)
	{
		if (isZhengshu==true)
		{
			if (yuShu!="")
			{
				ctx.fillText("...",kx,ky-lineHeight/5);

				kx+=gap*3/2;

				for (k=0;k<yuShu.length;k++)
				{
					ks=yuShu.substr(k,1);
					ctx.fillText(ks,kx,ky);

					arrYushuPos.push({"X":kx,"Y":ky,"V":ks,"visible":true});

					kx+=gap;
				}
			}
		}
		else
		if (dis_shang!="" && hasMore)
		{
			ctx.fillText("...",kx,ky-lineHeight/5);
		}
	}

}

function drawDivideWithoutCal(verti_idx,beichushu,chushu,shang)
{
	var maxRight=-1,maxBottom=-1;

	var c=gVerti[verti_idx].canv;

	var ctx = c.getContext("2d");

	ctx.save();

	ctx.fillStyle=g_fontstyle;
	ctx.lineWidth=2;

	ctx.font=fontsize+ "pt Times New Roman";
	ctx.textAlign="left";
	ctx.textBaseline="bottom";

	ctx.clearRect (0,0, c.width, c.height);

	arrChushu=new Array();
	arrBeiChushu=new Array();
	arrAmonRlt=new Array();
	arrFormula=new Array();

	var x,y,gap;
	x=200;
	y=50;

	gap=g_gap;



	var startX,startY;

    startX=50+(chushu.length+1)*gap;


	if (startX<0)
		startX=100;

	/*if (IsItMobile())
		startY=200;
	else*/
		startY=100;

	startX/=nScaleMulti;

	lineHeight=fontsize*3/2;

	ctx.beginPath();

	x=startX-gap-5;
	y=startY+gap/2+fontsize;

	for (i=chushu.length-1;i>=0;i--)
	{
		s=chushu.substr(i,1);


		ctx.fillText(s,x,y);

		arrChushu.push({"X":x,"Y":y,"V":s,"visible":true});









		if (chushu.substr(i,1)=="." )
			x-=gap*2/3;
		else
		if (chushu.substr(i-1,1)==".")
			x-=gap-gap*2/3;
		else
			x-=gap;

	}

	if (x>maxRight)
		maxRight=x;


	x=startX+gap/2;
	y=startY+gap/2+fontsize;
	for (i=0;i<beichushu.length;i++)
	{
		s=beichushu.substr(i,1);

		ctx.fillText(s,x,y);

		arrBeiChushu.push({"X":x,"Y":y,"V":s,"visible":true});










		if (beichushu.substr(i+1,1)==".")
			x+=gap*2/3;
		else
		if ( beichushu.substr(i,1)==".")
			x+=gap-gap*2/3;
		else
			x+=gap;

	}

	if (x>maxRight)
		maxRight=x;

	if (y>maxBottom)
		maxBottom=y;

	ctx.stroke();

	drawStruct(ctx,startX,startY,
		arrBeiChushu[arrBeiChushu.length-1].X+gap*3/2);




	var dis_beichushu=f_beichushu;
	var dis_chushu=f_chushu;
	var dis_shang= "";

	kx=arrChushu[arrChushu.length-1].X;

	/*if (IsItMobile())
		ky=100;
	else*/
		ky=50;



	for (k=0;k<dis_beichushu.length;k++)
	{
		ks=dis_beichushu.substr(k,1);

		ctx.fillText(ks,kx,ky);

		arrFormula.push({"X":kx,"Y":ky,"V":ks,"visible":true});

		if (k<dis_beichushu.length && dis_beichushu.substr(k+1,1)==".")
			kx+=gap*2/3;
		else
		if (dis_beichushu.substr(k,1)==".")
			kx+=gap-gap*2/3;
		else
			kx+=gap;
	}

	ks="÷";
	ctx.fillText(ks,kx,ky);
	kx+=gap;

	for (k=0;k<dis_chushu.length;k++)
	{
		ks=dis_chushu.substr(k,1);

		ctx.fillText(ks,kx,ky);

		arrFormula.push({"X":kx,"Y":ky,"V":ks,"visible":true});

		if (k<dis_chushu.length && dis_chushu.substr(k+1,1)==".")
			kx+=gap*2/3;
		else
		if (dis_chushu.substr(k,1)==".")
			kx+=gap-gap*2/3;
		else
			kx+=gap;
	}

	ks="=";
	ctx.fillText(ks,kx,ky);
	kx+=gap;

	if (!gVerti[verti_idx].blankFormula)
	{
		for (k=0;k<dis_shang.length;k++)
		{
			ks=dis_shang.substr(k,1);

			ctx.fillText(ks,kx,ky);

			if (cir_start!=cir_end && cir_start+1==k || cir_end==k)
			{

				var cx;
				if (ks==".")
					cx=kx+gap/2;
				else
					cx=kx+gap/4;

				var cy=ky-lineHeight*4/5;

				ctx.fillText(".",cx,cy);
			}

			arrFormula.push({"X":kx,"Y":ky,"V":ks,"visible":true});

			if (k<dis_shang.length && dis_shang.substr(k+1,1)==".")
				kx+=gap*2/3;
			else
			if (dis_shang.substr(k,1)==".")
				kx+=gap-gap*2/3;
			else
				kx+=gap;
		}

		if (isZhengshu==true)
		{
			if (yuShu!="")
			{
				ctx.fillText("...",kx,ky-lineHeight/5);

				kx+=gap*3/2;

				for (k=0;k<yuShu.length;k++)
				{
					ks=yuShu.substr(k,1);
					ctx.fillText(ks,kx,ky);

					arrYushuPos.push({"X":kx,"Y":ky,"V":ks,"visible":true});

					kx+=gap;
				}
			}
		}
		else
		if (dis_shang!="" && hasMore)
		{
			ctx.fillText("...",kx,ky-lineHeight/5);
		}
	}

	if (kx>maxRight)
		maxRight=kx;

	if (ky>maxBottom)
		maxBottom=ky;


	ctx.restore();

	var nc = document.createElement("canvas");
	nc.width = c.width;
	nc.height = c.height;
	nc.getContext("2d").drawImage(c,0,0);

	c.width=maxRight+gap;
	c.height=maxBottom+gap;

	gVerti[verti_idx].w=c.width;
	gVerti[verti_idx].h=c.height;

	ctx.drawImage(nc,0,0);

	gArrPoints.push({"verti":gVerti[verti_idx],"idx":verti_idx,"arrFactor1":arrChushu,"arrFactor2":arrBeiChushu,"arrAmonRlt":arrAmonRlt,"arrFormula":arrFormula});
}


function createchengfa(withoutResult)
{
	copyArr(pre_factor2,cur_pre);

	if (pre_factor2.length<=0 || pre_factor1.length<=0)
		return;

	copyArr(gfactor1,pre_factor1);
	copyArr(gfactor2,pre_factor2);






	bkbkbkook=withoutResult;

	drawChengfa();












}
function drawChengfa(verti_idx)
{
	var c=gVerti[verti_idx].canv;

	var left=0,top=0;

	var startX,startY;
	var maxRight=-1,maxBottom=-1;

	gap=g_gap;

	var gfactor1=gVerti[verti_idx].pm1;
	var gfactor2=gVerti[verti_idx].pm2;
	var gproduct=new Array();

	var arrFactor1=new Array();
	var arrFactor2=new Array();
	var arrAmonRlt=new Array();
	var arrFormula=new Array();



	var ctx = c.getContext("2d");

	ctx.save();

	ctx.fillStyle=g_fontstyle;
	ctx.lineWidth=2;

	ctx.font=fontsize+ "pt Times New Roman";
	ctx.textAlign="left";
	ctx.textBaseline="bottom";

	ctx.clearRect (0,0, c.width, c.height);


	startX=(gfactor1.length+gfactor2.length)*gap+4*gap;

	if (startX<6*gap)
		startX=6*gap;


	/*if (IsItMobile())
		startY=200;
	else*/
		startY=100;





	var arrPos=new Array(gfactor2.length);
	for (i=0;i<arrPos.length;i++)
		arrPos[i]=-1;




	var lastNonZero1,lastNonZero2;
	var firstNonZero1,firstNonZero2;

	for (lastNonZero1=gfactor1.length-1;lastNonZero1>=0;lastNonZero1--)
	{
		if (gfactor1[lastNonZero1]!=0 && gfactor1[lastNonZero1]!=".")
			break;
	}

	for (lastNonZero2=gfactor2.length-1;lastNonZero2>=0;lastNonZero2--)
	{
		if (gfactor2[lastNonZero2]!=0  && gfactor2[lastNonZero2]!=".")
			break;
	}

	for (firstNonZero1=0;firstNonZero1<gfactor1.length;firstNonZero1++)
	{
		if (gfactor1[firstNonZero1]!=0 && gfactor1[firstNonZero1]!=".")
			break;
	}

	for (firstNonZero2=0;firstNonZero2<gfactor2.length;firstNonZero2++)
	{
		if (gfactor2[firstNonZero2]!=0  && gfactor2[firstNonZero2]!=".")
			break;
	}





	lineHeight=fontsize*3/2;

	var line_x,line_y;
	var x,y,i,s,j,k;
	var nonZero_x;

	ctx.beginPath();

	x=startX-gap-5;
	y=startY+gap/2+fontsize;

	nonZero_x=0;

	var arrFact1=[];
	var arrFact2=[];

	for (i=gfactor1.length-1;i>=0;i--)
	{
		s=gfactor1[i];

		ctx.fillText(s,x,y);

		if (s!="0" && s!="." && nonZero_x<=0)
			nonZero_x=x;

		arrFactor1.push({"X":x+left,"Y":y+top,"V":s,"visible":true});

		arrFact1.push({"X":x,"Y":y});

		if (s==".")
			x-=gap*2/3;
		else
		if (i>=1 && gfactor1[i-1]==".")
			x-=gap-gap*2/3;
		else
			x-=gap;

	}

	y+=lineHeight;

	if (nonZero_x>0)
		x=nonZero_x;
	else
		x=startX-gap-5;


	var lastNonZero2startPos=lastNonZero2;
	if (lastNonZero2startPos<0)
		lastNonZero2startPos=0;
	for (i=lastNonZero2startPos;i>=0;i--)
	{
		s=gfactor2[i];

		ctx.fillText(s,x,y);

		arrFactor2.push({"X":x+left,"Y":y+top,"V":s,"visible":true});

		arrFact2.push({"X":x,"Y":y});

		arrPos[i]=x;

		if (s==".")
			x-=gap*2/3;
		else
		if (i>=1 && gfactor2[i-1]==".")
			x-=gap-gap*2/3;
		else
			x-=gap;

	}

	var prev_x=x;



	if (nonZero_x<=0)
	{
		nonZero_x=arrPos[lastNonZero2startPos];
	}

	if (gfactor2[lastNonZero2startPos+1]==".")
		x=nonZero_x+gap*2/3;
	else
		x=nonZero_x+gap;

	for (i=lastNonZero2startPos+1;i<gfactor2.length;i++)
	{
		s=gfactor2[i];

		ctx.fillText(s,x,y);

		arrFactor2.push({"X":x+left,"Y":y+top,"V":s,"visible":true});

		arrFact2.push({"X":x,"Y":y});

		arrPos[i]=x;

		if (s==".")
			x+=gap/3;
		else
		if (i+1<gfactor2.length && gfactor2[i+1]==".")
			x+=gap*2/3;
		else
			x+=gap;

	}

	if (x>startX-gap-5+gap)
		line_x=x;
	else
		line_x=startX-gap-5+gap;

	if (maxRight<line_x)
		maxRight=line_x


	x=prev_x;
	if (lastNonZero2<lastNonZero1)
	{
		for (i=lastNonZero1-lastNonZero2-1;i>=0;i--)
			x-=gap;
	}

	x-=gap;

	ctx.fillText("×",x,y);

	line_y=y;
	ctx.moveTo(line_x,line_y);

	var maxLeft=line_x;

	line_x=x-gap;
	ctx.lineTo(line_x,line_y);

	if (line_x<maxLeft)
		maxLeft=line_x;

	if (maxRight<line_x)
		maxRight=line_x


	if (!gVerti[verti_idx].blankFormula)
	{

		var mv,tv,sv,pv;

		var middleResult=new Array(lastNonZero2+1);
		for (i=0;i<=lastNonZero2;i++)
		{
			middleResult[i]=[];



		}

		var maxl=0;
		var p_nums=0;
		var	non_idx=-1;

		var tpv=[];

		var factor1_v=gfactor1.join("");
		var factor2_v=gfactor2.join("");
		if (factor1_v*1==0 ||factor2_v*1==0)
		{
			gproduct.push(0);

			if (nonZero_x<=0)
				x=arrFact1[0].X;
			else
				x=nonZero_x;

			y+=lineHeight;

			s="0";
			ctx.fillText(s,x,y);

			arrAmonRlt.push({"X":x+left,"Y":y+top,"V":s,"visible":true});
		}
		else
		{
			for (i=lastNonZero2;i>=firstNonZero2;i--)
			{
				if (gfactor2[i]==0 || gfactor2[i]==".")
					continue;

				tv=0;
				y+=lineHeight;
				x=arrPos[i];
				for (j=lastNonZero1;j>=firstNonZero1;j--)
				{
					if (gfactor1[j]==".")
						continue;

					mv=gfactor2[i]*gfactor1[j]+tv;

					sv=mv.toString();
					if (sv.length>1)
					{
						tv=parseInt(sv.substr(0,1));

						pv=sv.substr(1,1);
						middleResult[i].push(pv);
					}
					else
					{
						tv=0;
						pv=sv;

						middleResult[i].push(sv);
					}

					s=pv;
					ctx.fillText(s,x,y);

					arrAmonRlt.push({"X":x+left,"Y":y+top,"V":s,"visible":true});

					x-=gap;
				}

				if (tv!=0)
				{

					middleResult[i].push(tv);

					s=tv;
					ctx.fillText(s,x,y);
					arrAmonRlt.push({"X":x+left,"Y":y+top,"V":s,"visible":true});
				}
				else
					x+=gap;

				p_nums++;
				non_idx=i;

				if (middleResult[i].length>maxl)
					maxl=middleResult[i].length;
			}

			for (i=lastNonZero2;i>=0;i--)
			{
				if (gfactor2[i]==".")
					continue;

				while (middleResult[i].length<maxl)
					middleResult[i].push(0);

				middleResult[i].reverse();
			}



			if (p_nums>1)
			{
				line_y=y;

				ctx.moveTo(line_x,line_y);

				if (x>startX-gap-5+gap)
					line_x=x;
				else
					line_x=startX-gap-5+gap;



				ctx.lineTo(line_x,line_y);

				if (line_x<maxLeft)
					maxLeft=line_x;


				var perps;

				for (i=lastNonZero2;i>=0;i--)
				{
					if (gfactor2[i]==".")
						break;
				}

				if (i>=0)
					perps=lastNonZero2;
				else
					perps=lastNonZero2+1;

				perps=perps-1+maxl;

				y+=lineHeight;
				tv=0;
				for (k=0;k<perps;k++)
				{
					j=maxl-1-k;

					mv=0;

					for (i=lastNonZero2;i>=0;i--)
					{
						if (gfactor2[i]==".")
							continue;

						if (j>=0)
							mv=parseInt(middleResult[i][j])+mv;

						j++;

						if (j>=maxl)
							break;
					}

					mv+=tv;

					if (mv!=0 || k<perps-1)
					{
						sv=mv.toString();
						if (sv.length>1)
						{
							tv=parseInt(sv.substr(0,1));
							pv=sv.substr(1,1);
							tpv.push(pv);
						}
						else
						{
							tv=0;
							pv=sv;
							tpv.push(sv);
						}

						/*x=arrPos[lastNonZero2]-k*gap;

						s=pv;
						ctx.fillText(s,x,y);

						arrAmonRlt.push({"X":x+left,"Y":y+top,"V":s,"visible":true});
						*/
					}
				}

				if (tv!=0)
				{
					tpv.push(tv);
					/*s=tv;

					x-=gap;
					ctx.fillText(s,x,y);

					arrAmonRlt.push({"X":x+left,"Y":y+top,"V":s,"visible":true});
					*/
				}

				///////////////////
				//display
				while (tpv[tpv.length-1]=='0')
					tpv.pop();
				for (k=0;k<tpv.length;k++)
				{
					x=arrPos[lastNonZero2]-k*gap;

						s=tpv[k];
						ctx.fillText(s,x,y);

						arrAmonRlt.push({"X":x+left,"Y":y+top,"V":s,"visible":true});
				}
				//////////////////////////////////////////

				line_x=x-gap/2;
				ctx.lineTo(line_x,line_y);

				if (line_x<maxLeft)
					maxLeft=line_x;

				if (maxRight<line_x)
					maxRight=line_x
			}
			else
			{

				for (j=maxl-1;j>=0;j--)
				{
					tpv.push(middleResult[non_idx][j]);
				}
			}


			var numZero=0;

			for (i=lastNonZero1+1;i<gfactor1.length;i++)
				if (gfactor1[i]=="0")
					numZero++;

			for (i=lastNonZero2+1;i<gfactor2.length;i++)
				if (gfactor2[i]=="0")
					numZero++;


			maxl=0;
			var points=0;
			for (i=gfactor1.length-1;i>=0;i--)
				if (gfactor1[i]==".")
					break;

			if (i>=0)
			{
				points=gfactor1.length-1-i;
				maxl=points;
			}

			for (i=gfactor2.length-1;i>=0;i--)
				if (gfactor2[i]==".")
					break;

			if (i>=0)
			{
				points+=gfactor2.length-1-i;

				if (gfactor2.length-1-i>maxl)
					maxl=gfactor2.length-1-i;
			}

			var all_digits=tpv.length+numZero;
			var point_pos=all_digits-points;

			if (point_pos<=0)
			{
				gproduct.push(0);
				gproduct.push(".");

				i=point_pos;
				while (i<0)
				{
					gproduct.push(0);

					i++;
				}
			}

			k=tpv.length-1;
			while (k>=0)
			{
				if (gproduct.length==point_pos)
					gproduct.push(".");
				else
				{
					gproduct.push(tpv[k]);

					k--;
				}
			}

			tpv.reverse();

			k=0;

			while (k<numZero)
			{
				if (gproduct.length==point_pos)
					gproduct.push(".");
				else
				{
					if (gproduct.length<point_pos ||
							gproduct.length>point_pos && gproduct.length-point_pos<=maxl)
						gproduct.push(0);

					k++;
				}
			}



			if (point_pos<=0)
			{
				i=point_pos;
				while (i<=0)
				{
					x-=gap;

					s="0";
					ctx.fillText(s,x,y);

					arrAmonRlt.push({"X":x+left,"Y":y+top,"V":s,"visible":true});

					i++;
				}
			}

			if (numZero>0)
			{
				all_digits=0;
				for (i=0;i<gproduct.length;i++)
					if (gproduct[i]!=".")
						all_digits++;

				if (point_pos<=0)
					all_digits+=(point_pos-1);

				x=arrPos[lastNonZero2];
				i=tpv.length;
				k=tpv.length;
				while (k<all_digits)
				{
					if (gproduct[i]!=".")
					{
						x+=gap;

						s="0";
						ctx.fillText(s,x,y);

						arrAmonRlt.push({"X":x+left,"Y":y+top,"V":s,"visible":true});

						k++;
					}

					i++;
				}



				ctx.moveTo(line_x,line_y);

				line_x=x+gap;

				if (maxRight<line_x)
					maxRight=line_x

				ctx.lineTo(line_x,line_y);

				if (line_x<maxLeft)
					maxLeft=line_x;

				if (maxRight<line_x)
					maxRight=line_x
			}
			else
				x=arrPos[lastNonZero2];

		}

		for (i=gproduct.length-1;i>=0;i--)
		{
			s=gproduct[i];

			if (s==".")
				ctx.fillText(s,x,y);

			if (s==".")
				x-=gap*2/3;
			else
			if (i>=1 && gproduct[i-1]==".")
				x-=gap-gap*2/3;
			else
				x-=gap;
		}
	}

	gVerti[verti_idx].result=gproduct;

	maxr=drawFormula(ctx,maxLeft,startY,verti_idx,arrFormula);

	if (maxRight<maxr)
		maxRight=maxr;

	ctx.stroke();


	var nc = document.createElement("canvas");
	nc.width = c.width;
	nc.height = c.height;
	nc.getContext("2d").drawImage(c,0,0);

	c.width=maxRight+3*gap;
	c.height=y+3*gap;

	gVerti[verti_idx].w=c.width;
	gVerti[verti_idx].h=c.height;

	ctx.drawImage(nc,0,0);



	gArrPoints.push({"verti":gVerti[verti_idx],"idx":verti_idx,"arrFactor1":arrFactor1,"arrFactor2":arrFactor2,"arrAmonRlt":arrAmonRlt,"arrFormula":arrFormula});
}

function drawFormula(ctx,xLeft,ytop,verti_idx,arrFormula)
{
	var gfactor1=gVerti[verti_idx].pm1;
	var gfactor2=gVerti[verti_idx].pm2;
	var gproduct=gVerti[verti_idx].result;

	var left=0,top=0;

	var maxRight=-1;

	var gap=g_gap;

	var k,ks,kx,ky;

	kx=xLeft;





	ky=ytop-gap;



	for (k=0;k<gfactor1.length;k++)
	{
		ks=gfactor1[k];

		ctx.fillText(ks,kx,ky);

		arrFormula.push({"X":kx+left,"Y":ky+top,"V":ks,"visible":true});

		if (k<gfactor1.length-1 && gfactor1[k+1]==".")
			kx+=gap*2/3;
		else
		if (gfactor1[k]==".")
			kx+=gap-gap*2/3;
		else
			kx+=gap;
	}

	ks="×";
	ctx.fillText(ks,kx,ky);
	kx+=gap;

	for (k=0;k<gfactor2.length;k++)
	{
		ks=gfactor2[k];

		ctx.fillText(ks,kx,ky);

		arrFormula.push({"X":kx+left,"Y":ky+top,"V":ks,"visible":true});

		if (k<gfactor2.length-1 && gfactor2[k+1]==".")
			kx+=gap*2/3;
		else
		if (gfactor2[k]==".")
			kx+=gap-gap*2/3;
		else
			kx+=gap;
	}

	ks="=";
	ctx.fillText(ks,kx,ky);
	kx+=gap;


	if (!gVerti[verti_idx].blankFormula)
	{
		for (k=0;k<gproduct.length;k++)
		{
			ks=gproduct[k];

			ctx.fillText(ks,kx,ky);

			arrFormula.push({"X":kx+left,"Y":ky+top,"V":ks,"visible":true});

			if (k<gproduct.length-1 && gproduct[k+1]==".")
				kx+=gap*2/3;
			else
			if (gproduct[k]==".")
				kx+=gap-gap*2/3;
			else
				kx+=gap;
		}
	}

	maxRight=kx;

	return maxRight;
}



function drawJiafa(verti_idx)
{
	var x,y,i,s,j,k,mv,tv,sv;

	var c=gVerti[verti_idx].canv;

	var startX,startY;
	var maxRight=-1,maxBottom=-1;
	var maxLeft=c.width;

	gap=g_gap;

	var gfactor1=gVerti[verti_idx].pm1;
	var gfactor2=gVerti[verti_idx].pm2;
	var gproduct=new Array();

	var arrFactor1=new Array();
	var arrFactor2=new Array();
	var arrAmonRlt=new Array();
	var arrFormula=new Array();

	var dot_pos1;
	var dot_pos2;

	for (dot_pos1=0;dot_pos1<gfactor1.length;dot_pos1++)
	{
		if (gfactor1[dot_pos1]=='.')
			break;
	}

	for (dot_pos2=0;dot_pos2<gfactor2.length;dot_pos2++)
	{
		if (gfactor2[dot_pos2]=='.')
			break;
	}

	var ctx = c.getContext("2d");

	ctx.save();

	ctx.fillStyle=g_fontstyle;
	ctx.lineWidth=2;

	ctx.font=fontsize+ "pt Times New Roman";
	ctx.textAlign="left";
	ctx.textBaseline="bottom";

	ctx.clearRect (0,0, c.width, c.height);

	if (dot_pos1>=dot_pos2)
		startX=dot_pos1*gap+4*gap;
	else
		startX=dot_pos2*gap+4*gap;

	if (gfactor1.length-dot_pos1>=gfactor2.length-dot_pos2)
		startX+=(gfactor1.length-dot_pos1)*gap;
	else
		startX+=(gfactor2.length-dot_pos2)*gap;

	if (startX<6*gap)
		startX=6*gap;


	/*if (IsItMobile())
		startY=200;
	else*/
		startY=100;




	lineHeight=fontsize*3/2;

	var line_x,line_y;


	ctx.beginPath();

	x=startX-gap-5;
	y=startY+gap/2+fontsize;

	var dot_pos_x=x;

	var arrFact1=[];
	var arrFact2=[];

	for (i=gfactor1.length-1;i>=0;i--)
	{
		s=gfactor1[i];

		ctx.fillText(s,x,y);

		if (s==".")
			dot_pos_x=x;

		arrFactor1.push({"X":x,"Y":y,"V":s,"visible":true});

		arrFact1.push({"X":x,"Y":y});

		if (s==".")
			x-=gap*2/3;
		else
		if (i>=1 && gfactor1[i-1]==".")
			x-=gap-gap*2/3;
		else
			x-=gap;

	}

	if (x<maxLeft)
		maxLeft=x;

	x=dot_pos_x;
	y+=lineHeight;

	var start_p;
	if(dot_pos2<gfactor2.length)
	{
		start_p=dot_pos2;

		if (dot_pos1>=gfactor1.length)
			x+=gap*2/3;
	}
	else
	{
		start_p=gfactor2.length-1;

		if (dot_pos1<gfactor1.length)
			x-=gap*2/3;
	}

	for (i=start_p;i>=0;i--)
	{
		s=gfactor2[i];







		ctx.fillText(s,x,y);

		arrFactor2.push({"X":x,"Y":y,"V":s,"visible":true});

		arrFact2.push({"X":x,"Y":y});

		if (s==".")
			x-=gap*2/3;
		else
		if (i>=1 && gfactor2[i-1]==".")
			x-=gap-gap*2/3;
		else
			x-=gap;

	}

	if (x<maxLeft)
		maxLeft=x;

	var prev_x=x;

	if (start_p==dot_pos2)
	{
		if (dot_pos1>=gfactor1.length)
			x=dot_pos_x+gap;
		else
			x=dot_pos_x+gap/3;

		for (i=start_p+1;i<gfactor2.length;i++)
		{
			s=gfactor2[i];

			ctx.fillText(s,x,y);

			arrFactor2.push({"X":x,"Y":y,"V":s,"visible":true});

			arrFact2.push({"X":x,"Y":y});

			if (s==".")
				x+=gap/3;
			else
			if (i<gfactor2.length-1 && gfactor2[i+1]==".")
				x+=gap*2/3;
			else
				x+=gap;
		}
	}

	if (maxRight<x)
		maxRight=x;

	x=prev_x;

	if (x>startX-gap-5+gap)
		line_x=x;
	else
		line_x=startX-gap-5+gap;

	if (maxRight<line_x)
		maxRight=line_x


	if (dot_pos2<dot_pos1)
	{
		for (i=dot_pos1-dot_pos2-1;i>=0;i--)
			x-=gap;
	}

	x-=gap;

	ctx.fillText("+",x,y);

	line_y=y;
	line_x=x-gap/2;
	ctx.moveTo(line_x,line_y);

	var maxLeft=line_x;


	line_x=startX;
	if (line_x<maxRight)
		line_x=maxRight;

	ctx.lineTo(line_x,line_y);

	if (line_x<maxLeft)
		maxLeft=line_x;

	if (maxRight<line_x)
		maxRight=line_x


	if (!gVerti[verti_idx].blankFormula)
	{

		var gf1=new Array();
		var gf2=new Array();

		copyArr(gf1,gfactor1);
		copyArr(gf2,gfactor2);

		var ld1=0,ld2=0;
		for (i=gf1.length-1;i>=0;i--)
		{
			if (gf1[i]=='.')
				break;
			else
				ld1++;
		}

		if (i<0)
			ld1=0;

		for (i=gf2.length-1;i>=0;i--)
		{
			if (gf2[i]=='.')
				break;
			else
				ld2++;
		}

		if (i<0)
			ld2=0;


		if (ld2>ld1)
		{
			if (ld1==0)
				gf1.push('.')

			for (i=0;i<ld2-ld1;i++)
				gf1.push(0);
		}
		else
		if (ld2<ld1)
		{
			if (ld2==0)
				gf2.push('.')

			for (i=0;i<ld1-ld2;i++)
				gf2.push(0);
		}

		y+=lineHeight;
		x=arrFact2[0].X;
		for (i=1;i<arrFact2.length;i++)
			if (x<arrFact2[i].X)
				x=arrFact2[i].X;

		for (i=0;i<arrFact1.length;i++)
			if (x<arrFact1[i].X)
				x=arrFact1[i].X;

		i=gf1.length-1;
		j=gf2.length-1;

		mv=0;tv=0;
		while (i>=0 && j>=0)
		{
			if (gf1[i]=='.' || gf2[j]=='.')
			{
				s=".";
			}
			else
			{
				mv=parseInt(gf1[i])+parseInt(gf2[j])+tv;
				sv=mv.toString();
				if (sv.length>1)
				{
					tv=parseInt(sv.substr(0,1));
					s=sv.substr(1,1);
				}
				else
				{
					tv=0;
					s=sv;
				}
			}


			ctx.fillText(s,x,y);

			arrAmonRlt.push({"X":x,"Y":y,"V":s,"visible":true});

			if (s==".")
				x-=gap*2/3;
			else
			if (i>=1 && gf1[i-1]==".")
				x-=gap-gap*2/3;
			else
				x-=gap;

			gproduct.push(s);

			i--;
			j--;
		}

		var gf;
		if (i>=0 || j>=0)
		{
			if (i>=0)
				gf=gf1;
			else
			{
				gf=gf2;
				i=j;
			}

			while (i>=0)
			{
				if (tv==0)
					s=gf[i];
				else
				{
					mv=parseInt(gf[i])+tv;
					sv=mv.toString();
					if (sv.length>1)
					{
						tv=parseInt(sv.substr(0,1));
						s=sv.substr(1,1);
					}
					else
					{
						tv=0;
						s=sv;
					}
				}


				ctx.fillText(s,x,y);

				arrAmonRlt.push({"X":x,"Y":y,"V":s,"visible":true});

				if (s==".")
					x-=gap*2/3;
				else
				if (i>=1 && gf[i-1]==".")
					x-=gap-gap*2/3;
				else
					x-=gap;

				gproduct.push(s);

				i--;
			}
		}

		if (tv!=0)
		{
			s=tv;
			ctx.fillText(s,x,y);

			gproduct.push(s);

			arrAmonRlt.push({"X":x,"Y":y,"V":s,"visible":true});
		}
	}

	gproduct.reverse();
	gVerti[verti_idx].result=gproduct;

	maxr=drawFormula_Jia(ctx,maxLeft,startY,verti_idx,arrFormula);

	if (maxRight<maxr)
		maxRight=maxr;

	ctx.stroke();


	var nc = document.createElement("canvas");
	nc.width = c.width;
	nc.height = c.height;
	nc.getContext("2d").drawImage(c,0,0);

	c.width=maxRight+3*gap;
	c.height=y+3*gap;

	gVerti[verti_idx].w=c.width;
	gVerti[verti_idx].h=c.height;

	ctx.drawImage(nc,0,0);



	gArrPoints.push({"verti":gVerti[verti_idx],"idx":verti_idx,"arrFactor1":arrFactor1,"arrFactor2":arrFactor2,"arrAmonRlt":arrAmonRlt,"arrFormula":arrFormula});
}


function drawFormula_Jia(ctx,xLeft,ytop,verti_idx,arrFormula)
{
	var gfactor1=gVerti[verti_idx].pm1;
	var gfactor2=gVerti[verti_idx].pm2;
	var gproduct=gVerti[verti_idx].result;

	var maxRight=-1;

	var gap=g_gap;

	var k,ks,kx,ky;

	kx=xLeft;





	ky=ytop-gap;



	for (k=0;k<gfactor1.length;k++)
	{
		ks=gfactor1[k];

		ctx.fillText(ks,kx,ky);

		arrFormula.push({"X":kx,"Y":ky,"V":ks,"visible":true});

		if (k<gfactor1.length-1 && gfactor1[k+1]==".")
			kx+=gap*2/3;
		else
		if (gfactor1[k]==".")
			kx+=gap-gap*2/3;
		else
			kx+=gap;
	}

	ks="+";
	ctx.fillText(ks,kx,ky);
	kx+=gap;

	for (k=0;k<gfactor2.length;k++)
	{
		ks=gfactor2[k];

		ctx.fillText(ks,kx,ky);

		arrFormula.push({"X":kx,"Y":ky,"V":ks,"visible":true});

		if (k<gfactor2.length-1 && gfactor2[k+1]==".")
			kx+=gap*2/3;
		else
		if (gfactor2[k]==".")
			kx+=gap-gap*2/3;
		else
			kx+=gap;
	}

	ks="=";
	ctx.fillText(ks,kx,ky);
	kx+=gap;


	if (!gVerti[verti_idx].blankFormula)
	{
		for (k=0;k<gproduct.length;k++)
		{
			ks=gproduct[k];

			ctx.fillText(ks,kx,ky);

			arrFormula.push({"X":kx,"Y":ky,"V":ks,"visible":true});

			if (k<gproduct.length-1 && gproduct[k+1]==".")
				kx+=gap*2/3;
			else
			if (gproduct[k]==".")
				kx+=gap-gap*2/3;
			else
				kx+=gap;
		}
	}

	maxRight=kx;

	return maxRight;
}




function drawJianfa(verti_idx)
{
	var x,y,i,s,j,k,mv,tv,sv;

	var c=gVerti[verti_idx].canv;

	var startX,startY;
	var maxRight=-1,maxBottom=-1;
	var maxLeft=c.width;

	gap=g_gap;

	var gfactor1=gVerti[verti_idx].pm1;
	var gfactor2=gVerti[verti_idx].pm2;

	var sgf1=gfactor1.join("");
	var sgf2=gfactor2.join("");

	var neg=false;
	if (sgf2*1>sgf1*1)
	{
		gfactor1=gVerti[verti_idx].pm2;
		gfactor2=gVerti[verti_idx].pm1;

		neg=true;
	}

	var gproduct=new Array();

	var arrFactor1=new Array();
	var arrFactor2=new Array();
	var arrAmonRlt=new Array();
	var arrFormula=new Array();

	var dot_pos1;
	var dot_pos2;

	for (dot_pos1=0;dot_pos1<gfactor1.length;dot_pos1++)
	{
		if (gfactor1[dot_pos1]=='.')
			break;
	}

	for (dot_pos2=0;dot_pos2<gfactor2.length;dot_pos2++)
	{
		if (gfactor2[dot_pos2]=='.')
			break;
	}

	var ctx = c.getContext("2d");

	ctx.save();


	ctx.fillStyle=g_fontstyle;
	ctx.lineWidth=2;

	ctx.font=fontsize+ "pt Times New Roman";
	ctx.textAlign="left";
	ctx.textBaseline="bottom";

	ctx.clearRect (0,0, c.width, c.height);

	if (dot_pos1>=dot_pos2)
		startX=dot_pos1*gap+4*gap;
	else
		startX=dot_pos2*gap+4*gap;

	if (gfactor1.length-dot_pos1>=gfactor2.length-dot_pos2)
		startX+=(gfactor1.length-dot_pos1)*gap;
	else
		startX+=(gfactor2.length-dot_pos2)*gap;

	if (startX<6*gap)
		startX=6*gap;


	/*if (IsItMobile())
		startY=200;
	else*/
		startY=100;




	lineHeight=fontsize*3/2;

	var line_x,line_y;


	ctx.beginPath();

	x=startX-gap-5;
	y=startY+gap/2+fontsize;

	var dot_pos_x=x;

	var arrFact1=[];
	var arrFact2=[];

	for (i=gfactor1.length-1;i>=0;i--)
	{
		s=gfactor1[i];

		ctx.fillText(s,x,y);

		if (s==".")
			dot_pos_x=x;

		arrFactor1.push({"X":x,"Y":y,"V":s,"visible":true});

		arrFact1.push({"X":x,"Y":y});

		if (s==".")
			x-=gap*2/3;
		else
		if (i>=1 && gfactor1[i-1]==".")
			x-=gap-gap*2/3;
		else
			x-=gap;

	}

	if (x<maxLeft)
		maxLeft=x;

	x=dot_pos_x;
	y+=lineHeight;

	var start_p;
	if(dot_pos2<gfactor2.length)
	{
		start_p=dot_pos2;

		if (dot_pos1>=gfactor1.length)
			x+=gap*2/3;
	}
	else
	{
		start_p=gfactor2.length-1;

		if (dot_pos1<gfactor1.length)
			x-=gap*2/3;
	}

	for (i=start_p;i>=0;i--)
	{
		s=gfactor2[i];







		ctx.fillText(s,x,y);

		arrFactor2.push({"X":x,"Y":y,"V":s,"visible":true});

		arrFact2.push({"X":x,"Y":y});

		if (s==".")
			x-=gap*2/3;
		else
		if (i>=1 && gfactor2[i-1]==".")
			x-=gap-gap*2/3;
		else
			x-=gap;

	}

	if (x<maxLeft)
		maxLeft=x;

	var prev_x=x;

	if (start_p==dot_pos2)
	{
		if (dot_pos1>=gfactor1.length)
			x=dot_pos_x+gap;
		else
			x=dot_pos_x+gap/3;

		for (i=start_p+1;i<gfactor2.length;i++)
		{
			s=gfactor2[i];

			ctx.fillText(s,x,y);

			arrFactor2.push({"X":x,"Y":y,"V":s,"visible":true});

			arrFact2.push({"X":x,"Y":y});

			if (s==".")
				x+=gap/3;
			else
			if (i<gfactor2.length-1 && gfactor2[i+1]==".")
				x+=gap*2/3;
			else
				x+=gap;
		}
	}

	if (maxRight<x)
		maxRight=x;

	x=prev_x;

	if (x>startX-gap-5+gap)
		line_x=x;
	else
		line_x=startX-gap-5+gap;

	if (maxRight<line_x)
		maxRight=line_x


	if (dot_pos2<dot_pos1)
	{
		for (i=dot_pos1-dot_pos2-1;i>=0;i--)
			x-=gap;
	}

	x-=gap;

	ctx.fillText("-",x,y);

	line_y=y;
	line_x=x-gap/2;
	ctx.moveTo(line_x,line_y);

	var maxLeft=line_x;


	line_x=startX;
	if (line_x<maxRight)
		line_x=maxRight;

	ctx.lineTo(line_x,line_y);

	if (line_x<maxLeft)
		maxLeft=line_x;

	if (maxRight<line_x)
		maxRight=line_x


	if (!gVerti[verti_idx].blankFormula)
	{

		var gf1=new Array();
		var gf2=new Array();

		copyArr(gf1,gfactor1);
		copyArr(gf2,gfactor2);



		var ld1=0,ld2=0;
		for (i=gf1.length-1;i>=0;i--)
		{
			if (gf1[i]=='.')
				break;
			else
				ld1++;
		}

		if (i<0)
			ld1=0;

		for (i=gf2.length-1;i>=0;i--)
		{
			if (gf2[i]=='.')
				break;
			else
				ld2++;
		}

		if (i<0)
			ld2=0;


		if (ld2>ld1)
		{
			if (ld1==0)
				gf1.push('.')

			for (i=0;i<ld2-ld1;i++)
				gf1.push(0);
		}
		else
		if (ld2<ld1)
		{
			if (ld2==0)
				gf2.push('.')

			for (i=0;i<ld1-ld2;i++)
				gf2.push(0);
		}

		y+=lineHeight;
		x=arrFact2[0].X;
		for (i=1;i<arrFact2.length;i++)
			if (x<arrFact2[i].X)
				x=arrFact2[i].X;

		for (i=0;i<arrFact1.length;i++)
			if (x<arrFact1[i].X)
				x=arrFact1[i].X;

		i=gf1.length-1;
		j=gf2.length-1;

		mv=0;tv=0;
		while (i>=0 && j>=0)
		{
			if (gf1[i]=='.' || gf2[j]=='.')
			{
				s=".";
			}
			else
			{
				if (parseInt(gf1[i])-tv>=parseInt(gf2[j]))
				{
					mv=parseInt(gf1[i])-tv-parseInt(gf2[j]);

					tv=0;
				}
				else
				{
					mv=10+parseInt(gf1[i])-tv-parseInt(gf2[j]);
					tv=1;
				}

				s=mv;
			}


			/*ctx.fillText(s,x,y);

			arrAmonRlt.push({"X":x,"Y":y,"V":s,"visible":true});

			if (s==".")
				x-=gap*2/3;
			else
			if (i>=1 && gf1[i-1]==".")
				x-=gap-gap*2/3;
			else
				x-=gap;
			*/

			gproduct.push(s);

			i--;
			j--;
		}

		var gf;
		var label;
		if (i>=0 || j>=0)
		{
			if (i>=0)
			{
				gf=gf1;

				label=1;
			}
			else
			{
				gf=gf2;
				i=j;

				label=-1;
			}

			while (i>=0)
			{
				if (tv==0)
				{
					if (label>0)
						s=gf[i];
					else
					{
						s=10-gf[i];
						tv=1;
					}
				}
				else
				{
					if (label>0)
					{
						if (parseInt(gf[i])>=tv)
						{
							mv=parseInt(gf[i])-tv;

							tv=0;
						}
						else
						{
							mv=10-parseInt(gf[i])-tv;

							tv=1;
						}
					}
					else
					{
						mv=10-parseInt(gf[i])-tv;

						tv=1;
					}

					s=mv;
				}


				/*ctx.fillText(s,x,y);

				arrAmonRlt.push({"X":x,"Y":y,"V":s,"visible":true});

				if (s==".")
					x-=gap*2/3;
				else
				if (i>=1 && gf[i-1]==".")
					x-=gap-gap*2/3;
				else
					x-=gap;
				*/

				gproduct.push(s);

				i--;
			}
		}


		while (gproduct[gproduct.length-1]=='0')
		{
			if (gproduct.length>1 && gproduct[gproduct.length-2]!='.')
				gproduct.pop();
			else
				break;
		}


		for (i=0;i<gproduct.length;i++)
		{
			s=gproduct[i];

			ctx.fillText(s,x,y);

			arrAmonRlt.push({"X":x,"Y":y,"V":s,"visible":true});

			if (s==".")
				x-=gap*2/3;
			else
			if (i<gproduct.length-1 && gproduct[i+1]==".")
				x-=gap-gap*2/3;
			else
				x-=gap;

		}


		if (neg)
		{
			s="-";


			gproduct.push(s);


		}
	}
	gproduct.reverse();
	gVerti[verti_idx].result=gproduct;

	maxr=drawFormula_Jian(ctx,maxLeft,startY,verti_idx,arrFormula);

	if (maxRight<maxr)
		maxRight=maxr;

	ctx.stroke();


	var nc = document.createElement("canvas");
	nc.width = c.width;
	nc.height = c.height;
	nc.getContext("2d").drawImage(c,0,0);

	c.width=maxRight+3*gap;
	c.height=y+3*gap;

	gVerti[verti_idx].w=c.width;
	gVerti[verti_idx].h=c.height;

	ctx.drawImage(nc,0,0);



	gArrPoints.push({"verti":gVerti[verti_idx],"idx":verti_idx,"arrFactor1":arrFactor1,"arrFactor2":arrFactor2,"arrAmonRlt":arrAmonRlt,"arrFormula":arrFormula});
}


function drawFormula_Jian(ctx,xLeft,ytop,verti_idx,arrFormula)
{
	var gfactor1=gVerti[verti_idx].pm1;
	var gfactor2=gVerti[verti_idx].pm2;
	var gproduct=gVerti[verti_idx].result;

	var maxRight=-1;

	var gap=g_gap;

	var k,ks,kx,ky;

	kx=xLeft;





	ky=ytop-gap;



	for (k=0;k<gfactor1.length;k++)
	{
		ks=gfactor1[k];

		ctx.fillText(ks,kx,ky);

		arrFormula.push({"X":kx,"Y":ky,"V":ks,"visible":true});

		if (k<gfactor1.length-1 && gfactor1[k+1]==".")
			kx+=gap*2/3;
		else
		if (gfactor1[k]==".")
			kx+=gap-gap*2/3;
		else
			kx+=gap;
	}

	ks="-";
	ctx.fillText(ks,kx,ky);
	kx+=gap;

	for (k=0;k<gfactor2.length;k++)
	{
		ks=gfactor2[k];

		ctx.fillText(ks,kx,ky);

		arrFormula.push({"X":kx,"Y":ky,"V":ks,"visible":true});

		if (k<gfactor2.length-1 && gfactor2[k+1]==".")
			kx+=gap*2/3;
		else
		if (gfactor2[k]==".")
			kx+=gap-gap*2/3;
		else
			kx+=gap;
	}

	ks="=";
	ctx.fillText(ks,kx,ky);
	kx+=gap;


	if (!gVerti[verti_idx].blankFormula)
	{
		for (k=0;k<gproduct.length;k++)
		{
			ks=gproduct[k];

			ctx.fillText(ks,kx,ky);

			arrFormula.push({"X":kx,"Y":ky,"V":ks,"visible":true});

			if (k<gproduct.length-1 && gproduct[k+1]==".")
				kx+=gap*2/3;
			else
			if (gproduct[k]==".")
				kx+=gap-gap*2/3;
			else
				kx+=gap;
		}
	}

	maxRight=kx;

	return maxRight;
}





function drawContinuously(verti_idx)
{
	var x,y,i,s,j,k,mv,tv,sv;

	var c=gVerti[verti_idx].canv;

	var startX,startY;
	var maxRight=-1,maxBottom=-1;
	var maxLeft=c.width;

	gap=g_gap;

	var neg=false;

	var gfactor1=new Array();
	copyArr(gfactor1,gVerti[verti_idx].pm1);

	var gfactor2=new Array();
	copyArr(gfactor2,gVerti[verti_idx].pm2);

	var opera=new Array();
	copyArr(opera,gVerti[verti_idx].operator);

	var gproduct=new Array();

	var arrFactor1=new Array();
	var arrFactor2=new Array();
	var arrAmonRlt=new Array();
	var arrFormula=new Array();

	var dot_pos1;
	var dot_pos2;

	for (dot_pos1=0;dot_pos1<gfactor1.length;dot_pos1++)
	{
		if (gfactor1[dot_pos1]=='.')
			break;
	}

	for (dot_pos2=0;dot_pos2<gfactor2.length;dot_pos2++)
	{
		if (gfactor2[dot_pos2]=='.')
			break;
	}

	var ctx = c.getContext("2d");

	ctx.save();

	ctx.fillStyle=g_fontstyle;
	ctx.lineWidth=2;

	ctx.font=fontsize+ "pt Times New Roman";
	ctx.textAlign="left";
	ctx.textBaseline="bottom";

	ctx.clearRect (0,0, c.width, c.height);

	if (dot_pos1>=dot_pos2)
		startX=dot_pos1*gap+4*gap;
	else
		startX=dot_pos2*gap+4*gap;

	if (gfactor1.length-dot_pos1>=gfactor2.length-dot_pos2)
		startX+=(gfactor1.length-dot_pos1)*gap;
	else
		startX+=(gfactor2.length-dot_pos2)*gap;

	if (startX<6*gap)
		startX=6*gap;


	/*if (IsItMobile())
		startY=200;
	else*/
		startY=100;




	lineHeight=fontsize*3/2;

	var line_x,line_y;


	ctx.beginPath();

	y=startY+gap/2+fontsize;

	var dot_pos_x;

	var arrFact1=[];
	var arrFact2=[];


	var cont=0;
	var origc=addsubCount(math_form);

	while (1)
	{
		x=startX-gap-5;
		dot_pos_x=x;

	/*if (opera[cont]=='-')
	{
		var sgf1=gfactor1.join("");
		var sgf2=gfactor2.join("");

		var neg=false;
		if (sgf2*1>sgf1*1)
		{
			gfactor1=gVerti[verti_idx].pm2;
			gfactor2=gVerti[verti_idx].pm1;

			neg=true;
		}
	}*/


	for (i=gfactor1.length-1;i>=0;i--)
	{
		s=gfactor1[i];


			ctx.fillText(s,x,y);

		if (s==".")
			dot_pos_x=x;

		arrFactor1.push({"X":x,"Y":y,"V":s,"visible":true});

		arrFact1.push({"X":x,"Y":y});

		if (s==".")
			x-=gap*2/3;
		else
		if (i>=1 && gfactor1[i-1]==".")
			x-=gap-gap*2/3;
		else
			x-=gap;

	}

	if (x<maxLeft)
		maxLeft=x;

	x=dot_pos_x;
	y+=lineHeight;

	var start_p;
	if(dot_pos2<gfactor2.length)
	{
		start_p=dot_pos2;

		if (dot_pos1>=gfactor1.length)
			x+=gap*2/3;
	}
	else
	{
		start_p=gfactor2.length-1;

		if (dot_pos1<gfactor1.length)
			x-=gap*2/3;
	}

	for (i=start_p;i>=0;i--)
	{
		s=gfactor2[i];







		ctx.fillText(s,x,y);

		arrFactor2.push({"X":x,"Y":y,"V":s,"visible":true});

		arrFact2.push({"X":x,"Y":y});

		if (s==".")
			x-=gap*2/3;
		else
		if (i>=1 && gfactor2[i-1]==".")
			x-=gap-gap*2/3;
		else
			x-=gap;

	}

	if (x<maxLeft)
		maxLeft=x;

	var prev_x=x;

	if (start_p==dot_pos2)
	{
		if (dot_pos1>=gfactor1.length)
			x=dot_pos_x+gap;
		else
			x=dot_pos_x+gap/3;

		for (i=start_p+1;i<gfactor2.length;i++)
		{
			s=gfactor2[i];

			ctx.fillText(s,x,y);

			arrFactor2.push({"X":x,"Y":y,"V":s,"visible":true});

			arrFact2.push({"X":x,"Y":y});

			if (s==".")
				x+=gap/3;
			else
			if (i<gfactor2.length-1 && gfactor2[i+1]==".")
				x+=gap*2/3;
			else
				x+=gap;
		}
	}

	if (maxRight<x)
		maxRight=x;

	x=prev_x;

	if (x>startX-gap-5+gap)
		line_x=x;
	else
		line_x=startX-gap-5+gap;

	if (maxRight<line_x)
		maxRight=line_x


	if (dot_pos2<dot_pos1)
	{
		for (i=dot_pos1-dot_pos2-1;i>=0;i--)
			x-=gap;
	}

	x-=gap;

	var soper;
	//var fontnma=ctx.font;
	//if (opera[cont]=='-')
	//{
	//	soper="?6?1";
		//ctx.font=fontsize+ "pt Helvetica";
	//}
	//else
		soper=opera[cont];

	ctx.fillText(soper,x,y);

	//if (opera[cont]=='-')
	//{
	//	ctx.font=fontnma;
	//}

	line_y=y;
	line_x=x-gap/2;
	ctx.moveTo(line_x,line_y);

	var maxLeft=line_x;


	line_x=startX;
	if (line_x<maxRight)
		line_x=maxRight;

	ctx.lineTo(line_x,line_y);

	if (line_x<maxLeft)
		maxLeft=line_x;

	if (maxRight<line_x)
		maxRight=line_x



	{

		var gf1=new Array();
		var gf2=new Array();

		copyArr(gf1,gfactor1);
		copyArr(gf2,gfactor2);

		var ld1=0,ld2=0;
		for (i=gf1.length-1;i>=0;i--)
		{
			if (gf1[i]=='.')
				break;
			else
				ld1++;
		}

		if (i<0)
			ld1=0;

		for (i=gf2.length-1;i>=0;i--)
		{
			if (gf2[i]=='.')
				break;
			else
				ld2++;
		}

		if (i<0)
			ld2=0;


		if (ld2>ld1)
		{
			if (ld1==0)
				gf1.push('.')

			for (i=0;i<ld2-ld1;i++)
				gf1.push(0);
		}
		else
		if (ld2<ld1)
		{
			if (ld2==0)
				gf2.push('.')

			for (i=0;i<ld1-ld2;i++)
				gf2.push(0);
		}

		y+=lineHeight;
		x=arrFact2[0].X;
		for (i=1;i<arrFact2.length;i++)
			if (x<arrFact2[i].X)
				x=arrFact2[i].X;

		for (i=0;i<arrFact1.length;i++)
			if (x<arrFact1[i].X)
				x=arrFact1[i].X;

		i=gf1.length-1;
		j=gf2.length-1;

		mv=0;tv=0;
		while (i>=0 && j>=0)
		{
			if (gf1[i]=='.' || gf2[j]=='.')
			{
				s=".";
			}
			else
			{
				if (opera[cont]=='+')
				{
					mv=parseInt(gf1[i])+parseInt(gf2[j])+tv;
					sv=mv.toString();
					if (sv.length>1)
					{
						tv=parseInt(sv.substr(0,1));
						s=sv.substr(1,1);
					}
					else
					{
						tv=0;
						s=sv;
					}
				}
				else
				{
					if (parseInt(gf1[i])-tv>=parseInt(gf2[j]))
					{
						mv=parseInt(gf1[i])-tv-parseInt(gf2[j]);

						tv=0;
					}
					else
					{
						mv=10+parseInt(gf1[i])-tv-parseInt(gf2[j]);
						tv=1;
					}

					s=mv;
				}
			}


			if (opera[cont]=='+')
			{
				ctx.fillText(s,x,y);

				arrAmonRlt.push({"X":x,"Y":y,"V":s,"visible":true});

				if (s==".")
					x-=gap*2/3;
				else
				if (i>=1 && gf1[i-1]==".")
					x-=gap-gap*2/3;
				else
					x-=gap;
			}

			gproduct.push(s);

			i--;
			j--;
		}

		var gf;
		if (i>=0 || j>=0)
		{
			if (opera[cont]=='+')
			{
				if (i>=0)
					gf=gf1;
				else
				{
					gf=gf2;
					i=j;
				}

				while (i>=0)
				{
					if (tv==0)
						s=gf[i];
					else
					{
						mv=parseInt(gf[i])+tv;
						sv=mv.toString();
						if (sv.length>1)
						{
							tv=parseInt(sv.substr(0,1));
							s=sv.substr(1,1);
						}
						else
						{
							tv=0;
							s=sv;
						}
					}


					ctx.fillText(s,x,y);

					arrAmonRlt.push({"X":x,"Y":y,"V":s,"visible":true});

					if (s==".")
						x-=gap*2/3;
					else
					if (i>=1 && gf[i-1]==".")
						x-=gap-gap*2/3;
					else
						x-=gap;

					gproduct.push(s);

					i--;
				}
			}
			else
			{
				var label;
				if (i>=0)
				{
					gf=gf1;

					label=1;
				}
				else
				{
					gf=gf2;
					i=j;

					label=-1;
				}

				while (i>=0)
				{
					if (tv==0)
					{
						if (label>0)
							s=gf[i];
						else
						{
							s=10-gf[i];
							tv=1;
						}
					}
					else
					{
						if (label>0)
						{
							if (parseInt(gf[i])>=tv)
							{
								mv=parseInt(gf[i])-tv;

								tv=0;
							}
							else
							{
								mv=10-parseInt(gf[i])-tv;

								tv=1;
							}
						}
						else
						{
							mv=10-parseInt(gf[i])-tv;

							tv=1;
						}

						s=mv;
					}

					gproduct.push(s);

					i--;
				}
			}
		}

		if (opera[cont]=='+')
		{
			if (tv!=0)
			{
				s=tv;
				ctx.fillText(s,x,y);

				gproduct.push(s);

				arrAmonRlt.push({"X":x,"Y":y,"V":s,"visible":true});
			}
		}
		else
		{
			while (gproduct[gproduct.length-1]=='0')
			{
				if (gproduct.length>1 && gproduct[gproduct.length-2]!='.')
					gproduct.pop();
				else
					break;
			}


			for (i=0;i<gproduct.length;i++)
			{
				s=gproduct[i];

				ctx.fillText(s,x,y);

				arrAmonRlt.push({"X":x,"Y":y,"V":s,"visible":true});

				if (s==".")
					x-=gap*2/3;
				else
				if (i<gproduct.length-1 && gproduct[i+1]==".")
					x-=gap-gap*2/3;
				else
					x-=gap;

			}


			if (neg)
			{
				s="-";


				gproduct.push(s);


			}
		}


	}

	gproduct.reverse();

	if (addsubCount(math_form)<2 || cont>=1)
		break;


	copyArr(gfactor1,gproduct);
	copyArr(gfactor2,gVerti[verti_idx].pm3);

	for (dot_pos1=0;dot_pos1<gfactor1.length;dot_pos1++)
	{
		if (gfactor1[dot_pos1]=='.')
			break;
	}

	for (dot_pos2=0;dot_pos2<gfactor2.length;dot_pos2++)
	{
		if (gfactor2[dot_pos2]=='.')
			break;
	}

	gproduct.splice(0,gproduct.length);

	cont++;
	}

	gVerti[verti_idx].result=gproduct;

	maxr=drawFormula_Continuously(ctx,maxLeft,startY,verti_idx,arrFormula);

	if (maxRight<maxr)
		maxRight=maxr;

	ctx.stroke();


	var nc = document.createElement("canvas");
	nc.width = c.width;
	nc.height = c.height;
	nc.getContext("2d").drawImage(c,0,0);

	c.width=maxRight+3*gap;
	c.height=y+3*gap;

	gVerti[verti_idx].w=c.width;
	gVerti[verti_idx].h=c.height;

	ctx.drawImage(nc,0,0);



	gArrPoints.push({"verti":gVerti[verti_idx],"idx":verti_idx,"arrFactor1":arrFactor1,"arrFactor2":arrFactor2,"arrAmonRlt":arrAmonRlt,"arrFormula":arrFormula});
}

function drawFormula_Continuously(ctx,xLeft,ytop,verti_idx,arrFormula)
{
	var gfactor1=gVerti[verti_idx].pm1;
	var gfactor2=gVerti[verti_idx].pm2;
	var gproduct=gVerti[verti_idx].result;
	var amath_form=gVerti[verti_idx].math_form;

	var maxRight=-1;

	var gap=g_gap;

	var k,ks,kx,ky;

	kx=xLeft;





	ky=ytop-gap;



	for (k=0;k<amath_form.length;k++)
	{

		ks=amath_form.substr(k,1);

		ctx.fillText(ks,kx,ky);

		arrFormula.push({"X":kx,"Y":ky,"V":ks,"visible":true});

		if (k<amath_form.length-1 && amath_form.substr(k+1,1)==".")
			kx+=gap*2/3;
		else
		if (gfactor1[k]==".")
			kx+=gap-gap*2/3;
		else
			kx+=gap;
	}


	ks="=";
	ctx.fillText(ks,kx,ky);
	kx+=gap;


	if (!gVerti[verti_idx].blankFormula)
	{
		for (k=0;k<gproduct.length;k++)
		{
			ks=gproduct[k];

			ctx.fillText(ks,kx,ky);

			arrFormula.push({"X":kx,"Y":ky,"V":ks,"visible":true});

			if (k<gproduct.length-1 && gproduct[k+1]==".")
				kx+=gap*2/3;
			else
			if (gproduct[k]==".")
				kx+=gap-gap*2/3;
			else
				kx+=gap;
		}
	}

	maxRight=kx;

	return maxRight;
}



function downloadmath()
{
	var c = document.getElementById("scrawlArea");
	var url=c.toDataURL("image/png");

	var oA = document.createElement("a");
    oA.download = '数学竖式试题';
    oA.href = url;
    document.body.appendChild(oA);
    oA.click();
    oA.remove();
}

function printmath()
{
	var c = document.getElementById("scrawlArea");
	var url=c.toDataURL("image/png");

	var nw=window.open();




	nw.document.body.innerHTML = "<body onload=\"window.print()\"><br><img src=\""+url+"\"/></body>";
        setTimeout(() => {
            nw.print();
            nw.close();
        }, 20);
}
