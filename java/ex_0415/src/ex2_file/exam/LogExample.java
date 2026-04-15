package ex2_file.exam;

import java.io.File;

public class LogExample {
	public static void main(String[] args) {
		
		File dir = new File("C:\\\\Users\\\\adminn\\\\Desktop\\\\web-ay\\\\logs");
		
		if(!dir.exists()) {
			System.out.println("log 폴더가 없습니다. ");
			return;
		}
		File[] files = dir.listFiles((d, name) -> name.endsWith(".log"));
		
		int count = 0;
		long totalSize = 0;
		
		for(File f : files) {
			long size = f.length();
			System.out.println(f.getName() + "=" +size+"byte");
			
			totalSize += size;
			count++;
		}
		System.out.println("총 .log 파일 개수: " + count);
		System.out.println("총 용량 : " + totalSize + "byte");
		
	}
}
