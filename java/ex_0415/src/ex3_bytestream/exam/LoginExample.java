package ex3_bytestream.exam;

import java.io.File;
import java.io.FileInputStream;
import java.util.Scanner;

public class LoginExample {
	public static void main(String[] args) {
		
		File f = new File("C:\\Users\\adminn\\Desktop\\web-ay\\java\\ex_0415\\src\\ex3_bytestream\\exam\\member.txt");
		
		byte[] read= new byte[(int) f.length()];
		String content ="";
		
		try {
			FileInputStream fis = new FileInputStream(f);
			
			fis.read(read);
			
			content = new String(read, "UTF-8");
			
			fis.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
		String[] arr = content.split("\n");
		
		String fileId = arr[0].trim();
		String filePw = arr[1].trim();
		
		Scanner sc = new Scanner(System.in);
		
		
		System.out.println("아이디 입력 :");
		String id = sc.next();
		
		System.out.println("비밀번호 입력 :");
		String pw = sc.next();
		
		if(id.equals(fileId)&&pw.equals(filePw)) {
			System.out.println("로그인 성공");
		}else {
			System.out.println("로그인 실패");
		}
	}
}
