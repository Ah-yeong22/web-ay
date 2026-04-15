package ex2_file.exam;

import java.io.File;

public class Main {
	public static void main(String[] args) {
		
		File uploadDir = new File("uploads");
		if(!uploadDir.exists()) {
			boolean created = uploadDir.mkdirs();
			if(created) {
				System.out.println("생성함");
			}else {
				System.out.println("실패함");
				 return;
			}
		}
		if(uploadDir.isDirectory()) {
			System.out.println("폴더가 아님 ");
			return;
		}
		File[] items = uploadDir.listFiles();
		
		if(items == null) {
			System.out.println("폴더 내용을 읽을 수 없음");
			return;
		}
		for(File item : items) {
			if(item.isDirectory()) {
				System.out.println(item.getName());
			}else if( item.isFile()) {
				System.out.println(item.getName());
			}
		}
	}
}
