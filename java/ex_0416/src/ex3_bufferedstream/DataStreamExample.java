package ex3_bufferedstream;

import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.FileInputStream;
import java.io.FileOutputStream;

public class DataStreamExample {
	public static void main(String[] args) {

		try {
			// 1. 데이터 쓰기
			FileOutputStream fos = new FileOutputStream("data.dat");
			DataOutputStream dos = new DataOutputStream(fos);

			//쓴 순서와 읽은 순서가 같아야 함 
			dos.writeInt(100);
			dos.writeDouble(3.14);
			dos.writeBoolean(true);

			dos.close(); // ⭐ 반드시 닫기

			// 2. 데이터 읽기
			FileInputStream fis = new FileInputStream("data.dat");
			DataInputStream dis = new DataInputStream(fis);

			int a = dis.readInt();
			double b = dis.readDouble();
			boolean c = dis.readBoolean();

			dis.close();

			// 출력
			System.out.println(a);
			System.out.println(b);
			System.out.println(c);

		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}