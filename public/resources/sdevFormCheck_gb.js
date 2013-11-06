/*******************************************
*  ����֤ v1.3
*  ���ߣ�sohu sport-dev
*  ���ڣ�2009-03-07
\*******************************************
*                 ʹ�÷���
\*******************************************
*  ʵ������
   var f = new sdevFormCheck(string 'form1',function showErrorInfo);
*  ���У�����
   f.add(string 'name',object {notNull:true},string '����������'); 
*  ɾ��У�����
   f.remove(string 'name');
*  ����У������
   bool f.check(); �󶨵� onsubmit="return f.check()"
*  �����ú�����װ��
   function formSubmit(form){
 	  	if(f.check()) form.submit();	
   }
*  Ҫ���Ƽ���¼�룺
   ��Ҫ��У��Ĺ�������������Ϊ number����english Ȼ���ڱ���ı�ǩ�� д�� onkeydown="return f.allow(this,event)"
   ����ֻ�����Ʊ�������Ӣ�ģ�Ӣ������_�����ߴ����֣�������С���㣩 
\*******************************************/
if(typeof sdevFormCheck == 'undefined'){
	var sdevFormCheck = function(formName,alertFun){
		//���� formName ������  alertFun ��ʾ��ʾ�ĺ���
		this.formName = formName;
		this.alertFun = alertFun;
		this.elements = {};//�洢��ӽ������������
	};
	sdevFormCheck.prototype = {
		form: function(){
			//����ע��ı�
			return document.forms[this.formName];
		},
		getValue: function(name){
			//���ر���ֵ
			var ele = this.getItem(name);
			var value = '';
			switch(ele.tn.tagName){
				case 'input':
					value = this._inputValue(ele);
					break;
				case 'select':
					value = this._selectValue(ele);
					break;
				case 'textarea':
					value = this._textValue(ele);
					break;
			}
			return value;
		},
		getTagName: function(ele){
			var tn = {};
			if(typeof ele.length != 'undefined' && typeof ele.options == 'undefined'){
				tn.tagName = ele[0].tagName.toLowerCase();
				tn.type = ele[0].type.toLowerCase();
				tn.length = ele.length;
			}else{
				tn.tagName = ele.tagName.toLowerCase();
				if(tn.tagName == 'input'){
					tn.type = ele.type.toLowerCase();
				}else{
					tn.type = '';
				}
				tn.length = 1;
			}
			return tn;
		},
		getItem: function(name){
			//���ر���
			var form = this.form();
			var ele = form.elements[name];
			if(typeof ele.tn == 'undefined'){
				ele.tn = this.getTagName(ele);
			}
			return ele;
		},
		_inputValue: function(ele){
			var value = '';
			switch(ele.tn.type){
				case 'text':
				case 'hidden':
				case 'password':
				case 'file':
					value = this._textValue(ele);
					break;
				case 'checkbox':
					value = this._checkboxValue(ele);
					break;
				case 'radio':
					value = this._radioValue(ele);
					break;
				case 'button':
				case 'submit':
					//do nothing
			}
			return value;
		},
		_selectValue: function(ele){
			var index = ele.selectedIndex;
			return ele.options[index].value;
		},
		_textValue: function(ele){
			return ele.value;
		},
		_radioValue: function(ele){
			//����raido��ֵ
			var value = '';
			if(typeof ele.length != 'undefined'){
				for(var i=0;i<ele.length;i++){
					if(ele[i].checked == true){
						value = ele[i].value;
						break;
					}
				}	
			}else{
				value = ele.value;	
			}
			return value;
		},
		_checkboxValue: function(ele){
			//����checkbox��ֵ���Ǹ�����
			var value = '';
			if(typeof ele.length != 'undefined'){
				value = [];
				for(var i=0;i<ele.length;i++){
					if(ele[i].checked == true){
						value.push(ele[i].value);
					}
				}	
			}else{
				value = [];
				value.push(ele.value);	
			}
			return value;
		},
		check: function(){
			return this._checkAll();
		},
		_checkAll: function(){
			//�������
			var form = this.form();
			for(var key in this.elements){
				if(!this._checkElement(this.elements[key])){
					return false;	
				}
			}
			return true;
		},
		_checkElement: function(obj){
			var form = this.form();
			var name = obj.name;//����
			var filter = obj.filter;//��������
			var alt = obj.alt;//��ʾ����
			var value = this.getValue(name);
			var ele = this.getItem(name);
			var error = false;//û�з�������
			//���ȼ����Ƿ�Ϊ��
			if(filter.notNull){
				if(value == ''){
					error = error || true;
				}
			}
			//���鳤������
			if(filter.minLength > 0){
				if(typeof value == 'string') vLen = this.charlen(value);
				else vLen = value.length;
				if(vLen < filter.minLength){
					error = error || true;
				}
			}
			if(filter.maxLength > 0){
				if(typeof value == 'string') vLen = this.charlen(value);
				else vLen = value.length;
				if(vLen > filter.maxLength){
					error = error || true;
				}
			}
			//����ַ��Ƿ���ϱ�׼
			switch(filter.type){
				case 'number':
					if(!this._regNumber(value)){
						error = error || true;
					}
					break;
				case 'english':
					if(!this._regEnglish(value)){
						error = error || true;
					}
					break;
				case 'e-mail':
					if(!this._regEmail(value)){
						error = error || true;
					}
					break;
				case 'custom':
					if(!this._regCustom(value,filter.custom)){
						error = error || true;
					}
					break;
				case 'text':
				default:
			}
			//file���ͺ�׺���
			if(filter.suffix.length > 0){
				if(!this._regSuffix(value,filter.suffix)){
					error = error || true;
				}
			}
			if(error){
				this._setFocus(ele);
				if(this.alertFun){
					this.alertFun(alt);	
				}else{
					alert(alt);
				}
				return false;
			}else{
				return true;
			}
		},
		_setFocus: function(ele){
			if(ele.tn.length == 1){
				ele.focus();	
			}else if(ele.tn.length > 1){
				ele[0].focus();	
			}
		},
		_regNumber: function(value){
			if(value == '') return true;
			var reg = /^\d+$/;
			return reg.test(value);
		},
		_regEnglish: function(value){
			if(value == '') return true;
			var reg = /^[a-zA-Z0-9_]+$/;
			return reg.test(value);
		},
		_regEmail: function(value){
			if(value == '') return true;
			var reg = /^(\w+\.?)*\w+@(\w+\.)+[A-Za-z]{2,}$/i;
			return reg.test(value);
		},
		_regCustom: function(value,custom){
			if(value == '') return true;
			if(custom == '') return true;
			custom.replace("[","\.[");
			custom.replace("]","\]");
			var reg = new RegExp('^['+custom+']+$');
			return reg.test(value);
		},
		_regSuffix: function(value,suffix){
			if(value == '') return true;
			if(suffix.length == 0) return true;
			var pos = value.lastIndexOf('.');
			var fs = value.substring(pos+1).toLowerCase();
			for(var i=0;i<suffix.length;i++){
				if(fs == suffix[i].toLowerCase()) return true;	
			}
			return false;
		},
		showAllValue: function(){
			//��ʾ�������ֵ
			var str = "--------------["+this.formName+"]---------------\n";
			for(var key in this.elements){
				str += "["+key + "]    " + this.getValue(this.elements[key].name) + "\n";
			}
			str += "-----------------------------------\n";
			alert(str);
		},
		add: function(name,filter,alt){
			/**************************************
			* ����������name���������ö��󣬴�����ʾ����
			\**************************************
			* notNull
					true:����Ϊ��
					false:��Ϊ�գ�Ĭ��ֵ��
			* type 
					text:�ı����ͣ�Ĭ��ֵ��
			 		number:����Ϊ������
			 		english:����ΪӢ�ģ����֣�_
			 		custom:�Զ����ַ�������Ҫ���� custom�ֶ�
			 		e-mail:�ʼ�
			* custom �Զ����ַ������� !@#$%^&*
			* minLength ��С���ȣ�����ı������ַ�����������Ը�ѡ����ѡ���������
			* maxLength ���textarea����󳤶Ȳ���
			* suffix ['jpg','jpeg','bmp','gif'] �ļ���׺
			\**************************************/
			var _filter = {
				notNull: false,//�ɷ�Ϊ��
				type: 'text',//number,english,custom,e-mail
				custom: '',//�Զ����ַ�
				minLength:0,//�ַ�����С���ȣ�0����ʾ�����ƣ�> 1���������С�ڸ�ֵ����ʾ
				maxLength:0,//��󳤶����ƣ����ĺ�Ӣ�����ֶ���һ���ַ�
				suffix:[]//�����file���ͣ�����жϺ�׺
			};
			for(var key in filter){
				_filter[key] = filter[key];//
			}
			this.elements[name] = {
				'name': name,
				'filter': _filter,
				'alt': alt
			};
		},
		remove: function(name){
			delete this.elements[name];
		},
		_regKeyNumber: function(key,shiftKey){
			if((key >= 48 && key <= 57 && !shiftKey) || (key >= 96 && key <= 105)){
				return true;	
			}else{
				return false;	
			}
		},
		_regKeyEnglish: function(key,shiftKey){
			if(this._regKeyNumber(key,shiftKey) || (key >= 65 && key <= 90) || (key == 189 && shiftKey) || (key == 109 && shiftKey)){
				return true;	
			}else{
				return false;	
			}
		},
		_keyCheck: function(obj,key,filter,shiftKey){
			var error = false;//û�з�������
			switch(filter.type){
				case 'number':
					if(!this._regKeyNumber(key,shiftKey)){
						error = error || true;
					}
					break;
				case 'english':
					if(!this._regKeyEnglish(key,shiftKey)){
						error = error || true;
					}
					break;
			}
			if(filter.maxLength > 0){
				if(this.charlen(obj.value) >= filter.maxLength){
					error = error || true;
				}
				
			}
			if(error){
				return false;
			}else{
				return true;
			}
		},
		charlen: function(string){
			//�����ַ����ȣ��ֵ�˫�ֽ�
			var len = 0;
			for(var i=0;i<string.length;i++){
				if(string.charCodeAt(i) > 0 && string.charCodeAt(i) < 128){
					len += 1;	
				}else{
					len += 2;	
				}
			}
			return len;
		},
		subsub: function(string,length){
			//���ַ�������
			var str = '';
			var len = 0;
			for(var i=0;i<string.length;i++){
				var charCode = string.charCodeAt(i);
				var char = string.charAt(i);
				if(charCode > 0 && charCode < 128){
					len += 1;	
				}else{
					len += 2;	
				}
				if(len <= length){
					str += char;
				}else{
					break;	
				}
			}
			return str;
		},
		allow: function(obj,evt){
			var name = obj.name;
			if(typeof this.elements[name] == 'undefined') return true;
			var filter = this.elements[name].filter;
			var key = evt.keyCode;
			if(key == 8 || key == 46 || key == 37 || key == 39) return true;
			return this._keyCheck(obj,key,filter,evt.shiftKey);
		},
		cut: function(obj,evt){
			var name = obj.name;
			if(typeof this.elements[name] == 'undefined') return true;
			var filter = this.elements[name].filter;
			var key = evt.keyCode;
			if(key == 8 || key == 46 || key == 37 || key == 39) return;
			if(filter.maxLength > 0){
				if(this.charlen(obj.value) > filter.maxLength){
					obj.value = this.subsub(obj.value,filter.maxLength);
				}
			}
		}
	};
}