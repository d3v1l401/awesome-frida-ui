'use strict';
//Android O: 
//ARM32/64: _ZN3art7DexFile10OpenCommonEPKhjRKNSt3__112basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEjPKNS_10OatDexFileEbbPS9_PNS0_12VerifyResultE
//Android P:
//ARM32/64: _ZN3art13DexFileLoader10OpenCommonEPKhmS2_mRKNSt3__112basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEjPKNS_10OatDexFileEbbPS9_NS3_10unique_ptrINS_16DexFileContainerENS3_14default_deleteISH_EEEEPNS0_12VerifyResultE
//if u want to get own func name,u can use this script to get it!
var moduleFuncName;
var m =  Module.enumerateExportsSync('libart.so');
m.forEach(function(m){
	if(m.name.indexOf("OpenCommon") != -1){

		moduleFuncName = m.name;
		send("moduleFuncName: "+ m.name);
};
	if(m.name.indexOf("OpenMemory") != -1){

		moduleFuncName = m.name;
		send("moduleFuncName: "+ m.name);
	}

});

var moduleOFunc = "_ZN3art7DexFile10OpenCommonEPKhjRKNSt3__112basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEjPKNS_10OatDexFileEbbPS9_PNS0_12VerifyResultE";
var modulePFunc = "_ZN3art13DexFileLoader10OpenCommonEPKhmS2_mRKNSt3__112basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEjPKNS_10OatDexFileEbbPS9_NS3_10unique_ptrINS_16DexFileContainerENS3_14default_deleteISH_EEEEPNS0_12VerifyResultE";
var moduleLowOFunc = "_ZN3art7DexFile10OpenMemoryEPKhjRKNSt3__112basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEjPNS_6MemMapEPKNS_10OatDexFileEPS9_";

if(moduleOFunc == moduleFuncName || modulePFunc == moduleFuncName){
	send("=========================================");
	send("Hook Start");
	var OpenCommonFunc = Module.findExportByName("libart.so","_ZN3art7DexFile10OpenCommonEPKhjRKNSt3__112basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEjPKNS_10OatDexFileEbbPS9_PNS0_12VerifyResultE");
	send("OpenCommonFuncAddr: "+ OpenCommonFunc);
	if(OpenCommonFunc != undefined){
		Interceptor.attach(OpenCommonFunc,{
		onEnter: function(args){
			send("Hooked Function");
			send("base: "+ args[1]);
			send("size: "+ args[2].toInt32());
			// send(hexdump(
			// 	args[1],{
			// 		offset: 0,
			// 		length: 64,
			// 		header: true,
			// 		ansi: true


			// 	}
			// 	));
			var begin = args[1];
			send("magic : " + Memory.readUtf8String(begin))
			var address = parseInt(begin,16) + 0x20;
			var dex_size = Memory.readInt(ptr(address));
			send("dex_size :" + dex_size);
			var file = new File("/sdcard/" + dex_size + ".dex", "wb");
			file.write(Memory.readByteArray(begin, dex_size));
			file.flush();
			file.close();


		},
		onLeave: function(retval){
			send("Finished!!!");
			send("=========================================");
		}
	});

}else{
	send("Null Point!!!");
}


}else if(moduleFuncName == moduleLowOFunc){
	var DEX_MAGIC = 0x0A786564;
	var dexrec = [];

	var openmemory = Module.findExportByName("libart.so", "_ZN3art7DexFile10OpenMemoryEPKhjRKNSt3__112basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEEjPNS_6MemMapEPKNS_10OatDexFileEPS9_");
	if(openmemory != undefined) {
		send("openmemory at" + openmemory);
		Interceptor.attach(openmemory, {
			onEnter: function (args) {
				if(Memory.readU32(args[1]) == DEX_MAGIC) {
					dexrec.push(args[1]);
				}
			},
			onLeave: function (retval) {

			}
		});
	}

	if(Java.available) {
		Java.perform(function(){

			var dexBase64 = "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Zy9yZWZsZWN0L01ldGhvZDsAFUxqYXZhL3V0aWwvQXJyYXlMaXN0OwAVTGphdmEvdXRpbC9BcnJheUxpc3Q8AClMamF2YS91dGlsL0FycmF5TGlzdDxMamF2YS9sYW5nL1N0cmluZzs+OwAXTGphdmEvdXRpbC9Db2xsZWN0aW9uczsAF0xqYXZhL3V0aWwvRW51bWVyYXRpb247ACtMamF2YS91dGlsL0VudW1lcmF0aW9uPExqYXZhL2xhbmcvU3RyaW5nOz47ABRMamF2YS91dGlsL0l0ZXJhdG9yOwAQTGphdmEvdXRpbC9MaXN0OwADVEFHAAFWAAJWTAACVloAAVoAAlpMABJbTGphdmEvbGFuZy9DbGFzczsAE1tMamF2YS9sYW5nL09iamVjdDsAE1tMamF2YS9sYW5nL1N0cmluZzsAG1tMamF2YS9sYW5nL3JlZmxlY3QvTWV0aG9kOwADYWRkAAZhcHBlbmQAC2NsYXNzTG9hZGVyAA1jbGFzc05hbWVMaXN0AAljbGFzc2xpc3QABWNsYXp6AAFkAAtkZXhFbGVtZW50cwARZGV4RWxlbWVudHNMZW5ndGgAB2RleEZpbGUAAWUAAmUyAAdlbnRyaWVzAAxlbnVtZXJhdGlvbnMABmVxdWFscwAFZmllbGQACWZpZWxkTmFtZQADZ2V0AAhnZXRDbGFzcwAQZ2V0Q2xhc3NOYW1lTGlzdAAVZ2V0Q2xhc3NOYW1lTGlzdEFycmF5ABBnZXREZWNsYXJlZEZpZWxkABJnZXREZWNsYXJlZE1ldGhvZHMACWdldExlbmd0aAAHZ2V0TmFtZQAOZ2V0T2JqZWN0RmllbGQAEWdldFBhcmFtZXRlclR5cGVzAA1nZXRTdXBlcmNsYXNzAA9oYXNNb3JlRWxlbWVudHMAB2hhc05leHQAAWkABmludm9rZQAIaXRlcmF0b3IADGxvYWQgY2xhc3M6IAAMbG9hZEFsbENsYXNzAAlsb2FkQ2xhc3MABm1ldGhvZAAHbWV0aG9kcwAEbmFtZQAIbmFtZWxpc3QABG5leHQAC25leHRFbGVtZW50AAZvYmplY3QABG9ianMAB3Bhcm1sZW4ACHBhdGhMaXN0AA9wcmludFN0YWNrVHJhY2UABnJldHZhbAANc2V0QWNjZXNzaWJsZQAEc2l6ZQAEc29ydAAHc3VjY2VzcwAHdG9BcnJheQAIdG9TdHJpbmcAFHRyeSB0byBsb2FkIG1ldGhvZDogAAV2YWx1ZQAAAQAAAAoAAAACAAAACgAAAAIAAAAKAAsAAgAAAAoAGQABAAAACwAAAAEAAAAGAAAAAQAAABUAAAABAAAAFwAAAAIAAAALAAsAAQAAABkAARcGAgMBaBwGFwAXFBcBFyAXGRcEAAAAAAAAAAAAAQAAABkLAAAAAAAAAAAAAAEAAAAAAAAAAgAAADQLAAAOAA4AJAE0DlsEADUSIsMDATkLSwMCOgEdAwNQAS3/BAQ/FCVpoQUEQgUBBQIFAxwfPAA1ATQOSwQAWRIiaQMBYRs8ABMCXEIOSwMANwYBEBBLAwFBEEtdBQEeAwE9CTsFARkeAwE8CjxNBQEfAD0BNA5LBAA2EiL/AwJYDEsEAzcGFEsDBFccARoPaQMHVhFaAwheAS0DCV0aASYPSwJ7dwUHBQgFCUIFAgUDBQQgBQAbIAABAAEAAQAAAFQLAAAEAAAAcBAOAAAADgAHAAEAAgABAFgLAABBAAAAIgARAHAQGwAAABoBXgBxIAQAFgAMARoCOABxIAQAIQAMAXEQFQABAAoCEgM1IyUAcSAUADEADAQaBToAcSAEAFQADAQfBAQAbhAGAAQADARyECEABAAKBTgFDAByECIABAAMBR8FCwBuIBwAUAAo8dgDAwEo3CgCDQFxECAAAAARAAAABQAAADIAAQABAQc8AwABAAIAAACHCwAADgAAAHEQAgACAAwAbhAeAAAACgEjERoAbiAfABAAEQEFAAIAAgABAJgLAAAxAAAAbhAPAAMADABuEAkAAAAMARwCCgBuEAkAAgAMAm4gEAAhAAoBOQEdAG4gBwBAAAwBEhJuIBcAIQBuIBYAMQAMAhECDQFuEAwAAQAoCQ0BbhANAAEAbhAKAAAADAAo1hIBEQEAABQAAAAMAAEAAQIJJgghAAAOAAEAAwABAMILAAB7AAAAcRACAA0ADABuEB0AAAAMAXIQIwABAAoCOAJsAHIQJAABAAwCHwILAG4gCwAtAAwDbhAIAAMADAQaBQYAIgYMAHAQEQAGABoHUgBuIBIAdgBuEAkAAwAMB24gEgB2AG4QEwAGAAwGcSAAAGUAIUUSBjVWPwBGBwQGbhAZAAcADAghiCOJGQAaCgYAIgsMAHAQEQALABoMZwBuIBIAywBuEAkAAwAMDG4gEgDLABoMAgBuIBIAywBuEBgABwAMDG4gEgDLAG4QEwALAAwLcSAAALoAEgpuMBoApwkaCgYAGgtkAHEgAAC6ANgGBgEowiiRKAINAA4AAAAAAAAAdAABAAEBDXkBAAUAABoBgYAEiBgBCaAYAQnAGQEJ7BkBCfAaEQAAAAAAAAABAAAAAAAAAAEAAABpAAAAcAAAAAIAAAAcAAAAFAIAAAMAAAAaAAAAhAIAAAQAAAABAAAAvAMAAAUAAAAlAAAAxAMAAAYAAAABAAAA7AQAAAIgAABpAAAADAUAAAEQAAAKAAAAyAoAAAUgAAABAAAAFgsAAAQgAAABAAAAGQsAAAMQAAADAAAALAsAAAYgAAABAAAAPAsAAAMgAAAFAAAAVAsAAAEgAAAFAAAACAwAAAAgAAABAAAAhA4AAAAQAAABAAAAoA4AAA==";
			var application = Java.use("android.app.Application");
			var BaseDexClassLoader = Java.use("dalvik.system.BaseDexClassLoader");
			var Base64 = Java.use("android.util.Base64");
			var FileOutputStream = Java.use("java.io.FileOutputStream");
			var DexClassLoader = Java.use("dalvik.system.DexClassLoader");

			var reflectField = Java.use("java.lang.reflect.Field");
			var reflectMethod = Java.use("java.lang.reflect.Method");
			var reflectObject = Java.use("java.lang.Object");
			var reflectClass = Java.use("java.lang.Class");
			var reflectString = Java.use("java.lang.String");
			var reflectClassloader = Java.use("java.lang.ClassLoader");


			if(application != undefined) {
				application.attach.overload('android.content.Context').implementation = function(context) {
					var result = this.attach(context);
					var classloader = context.getClassLoader();
					var filesDir = context.getFilesDir();
					var codeCacheDir = context.getCodeCacheDir();
					send("files dir: " + filesDir);
					send("code cache dir: " + codeCacheDir);
					if(classloader != undefined) {
						var casedloader = Java.cast(classloader, BaseDexClassLoader);
						var dexbytes = Base64.decode(dexBase64, 0);
						var dexpath = filesDir + "/emmm.dex";
						var fout = FileOutputStream.$new(dexpath);
						fout.write(dexbytes, 0, dexbytes.length);
						fout.close();
						send("write dex to " + dexpath);

						var dexstr = dexpath.toString();
						var cachestr = codeCacheDir.toString();

						var dyndex = DexClassLoader.$new(dexstr, cachestr, cachestr, classloader);
						send(dyndex.toString());
						var EnumerateClass = dyndex.loadClass("com.smartdone.EnumerateClass");
						var castedEnumerateClass = Java.cast(EnumerateClass, reflectClass);
						var methods = castedEnumerateClass.getDeclaredMethods();
						// loadAllClass
						var loadAllClass = undefined;
						for(var i in methods) {
							send(methods[i].getName());
							if(methods[i].getName() == "loadAllClass") {
								send("find loadAllClass");
								loadAllClass = methods[i];
							}
						}
						if(loadAllClass != undefined) {
							send("loadAllClass: " + loadAllClass.toString());
							var args = Java.array('Ljava.lang.Object;',[classloader]);
							var classlist = loadAllClass.invoke(null , args);
							send("start dump dex ");
							for(var i in dexrec) {
								if(Memory.readU32(dexrec[i]) == DEX_MAGIC) {
									var dex_len = Memory.readU32(dexrec[i].add(0x20));
									var dumppath = filesDir.toString() + "/" + dex_len.toString(0x10) + ".dex";
									send(dumppath);
									var dumpdexfile = new File(dumppath, "wb");
									dumpdexfile.write(Memory.readByteArray(dexrec[i], dex_len));
									dumpdexfile.close();
									send("write file to " + dumppath);
								}
							}
						}


					} else {
						console.error("unable get classloader");
					}
					return result;
				}
			}
		});
	}
}
else{
	send("Function not exist!\n","Please modify the function name");
}
