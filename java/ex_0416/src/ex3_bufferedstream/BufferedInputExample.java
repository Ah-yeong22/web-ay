package ex3_bufferedstream;

import java.io.BufferedInputStream;
import java.io.FileInputStream;

//기본 스트림만 있어도 파일을 읽거나 쓰는것이 가능하다. 
//하지만 속도가 느리거나 기능이 부족할 수 잇다. (읽고, 쓰기만 있음)
//한 번에 어느정도 묶어서 읽고 내부 버퍼에 저장해 뒀다가 꺼내서 쓴다. 
public class BufferedInputExample {
	//BufferedInputStream, BufferedOutputStream
	//바이트 스트림에 버퍼 기능을 추가한다. 
	//바이트 기반스트림과 함께 사용
	
	public static void main(String[] args) {
		try {
			FileInputStream fis = new FileInputStream("test.txt");
			BufferedInputStream bis = new BufferedInputStream(fis);
			
			int data;
			while((data = bis.read())!=-1) {
				System.out.println((char)data);
			}
			
			//닫을 때 보조스트림을 먼저 닫고 기반스트림을 닫아야 함 
			
			bis.close();
			fis.close();
		} catch (Exception e) {
			// TODO: handle exception
		}
	}
}
