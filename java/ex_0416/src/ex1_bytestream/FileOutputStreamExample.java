package ex1_bytestream;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;

public class FileOutputStreamExample {
	public static void main(String[] args) {
		FileOutputStream fos = null;
		try {
			//내가 기록하려고 할 때 목적지가 없어질수도 있기 때문에 예외가 발생할 수 있음
			//예외처리 해줘야 함 
			
			//목적지에 파일이나 폴더가 없으면 만들어줌 
			fos = new FileOutputStream("test.txt");
			
			//목적지까지 가사ㅓ 작성하려고 할 때 없을수도 잇기 때문에 
			//예외가 발생할 수 있어 예외처리
			fos.write('f');
			fos.write('i');
			fos.write('l');
			fos.write('e');
			
			String msg = "안녕하세요";
			String msg2 = "메롱메롱";
			
			fos.write(msg.getBytes());
			fos.write(msg2.getBytes());
			System.out.println("작성 완료");
			
			fos.close();
			
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		}catch(IOException e) {
			e.printStackTrace();
		} finally {
			try {
				if(fos != null) {
					fos.close();
				}
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}

}
