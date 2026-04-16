package ex2_charstream.exam;

import java.io.FileReader;

public class Example {
	public static void main(String[] args) {
		//test.txt 파일에 아무 내용이나 적는다. 
		//내용을 읽어와서 영어 대문자와 소문자가 몇개 있는지 각각 출력해라 
		
		int upper = 0;
		int lower = 0;
		
		try {
			FileReader fr = new FileReader("test.txt");
			
			int code;
			
			while((code  = fr.read()) != -1) {
				char ch = (char) code;
				
				if(ch >= 'A' && ch <= 'Z') {
					upper++;
				}
				else if(ch >='a' && ch <= 'z') {
					lower++;
				}
			}
			fr.close();
			
			System.out.println("대문자 개수 :"+ upper);
			System.out.println("소문자 개수 : " + lower);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
