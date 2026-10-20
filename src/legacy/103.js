// Adapted from supplied SYKM SceneScript. See docs/SOURCE-AUDIT.md.
export default function createLegacy(ctx) {
const {shared,engine,input,thisScene,Vec3,createScriptProperties,Math} = ctx;
'use strict';

var scriptProperties = createScriptProperties()
	.addCheckbox({
		name: 'user_phy_check',
		label: 'user_phy_check',
		value: true
	})
	.finish();
let day;
function update(value){

	let time = new Date();
	let date = time.getDate();
	let month = time.getMonth()+1;
	let year = time.getFullYear();
	let text1 = "N";
	let text2 = "N";
	let text3 = "N";
	let textall = "N";
	if(date<10){
		date='0'+date;
	}
	if(month<10){
		month='0'+month;
	}
	if(year<10){
		year='0'+year;
	}

	//时间缩放倍数是否动过
	if(shared.kt==10){
		text1="T";//未动过为真实
	}
	else{
		text1="F"
	}

	//引力牢笼是否打开
	if(shared.ylll==false){
		text2="T";//未打开为真实
	}
	else{
		text2="F"
	}


	//温度计算缩放倍数
	if(shared.k_temp_dist==1)
	{
		text3="T";//真
	}
	else if(shared.k_temp_dist>1 && shared.k_temp_dist<6)
	{
		text3="C";//自定义
	}
	else if(shared.k_temp_dist<=7 && shared.k_temp_dist>=6)
	{
		text3="D";//默认
	}
	else
	{
		text3="F";//假
	}
	
	
	if(shared.userset === "Ht:200 Lt:-100 / O:0.30 F:2 Ft:-70 / Ro:0.21 Cd:0.20 / dt:5 n:50 / KT:10"){
		textall="D";
	}
	else{
		textall="C"
	}
	
	shared.user_phy_check=scriptProperties.user_phy_check;
	if(shared.user_phy_check==true)//是否使能用户检查
	{
		shared.text="/"+text1+"/"+text2+"/"+text3+"/"+textall;
	}
	else
	{
		shared.text="";
	}
	value= year+'-'+month+'-'+date+shared.text;
	return value
}

return {update,scriptProperties};
}
