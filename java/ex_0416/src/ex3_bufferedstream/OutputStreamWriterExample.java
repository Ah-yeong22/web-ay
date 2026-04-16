package ex3_bufferedstream;

import java.io.FileOutputStream;
import java.io.OutputStreamWriter;

public class OutputStreamWriterExample {
	public static void main(String[] args) {

		try (
			FileOutputStream fos = new FileOutputStream("test.txt");
			OutputStreamWriter os = new OutputStreamWriter(fos, "UTF-8")
		) {

			String[] strArray = {
				"OutputStreamWriter에 대해서 배웁니다.\n",
				"we are learning about OutputStreamWriter\n"
			};

			// 배열 내용 파일에 쓰기
			for(String str : strArray) {
				os.write(str);
			}

			System.out.println("파일 저장 완료!");

		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}