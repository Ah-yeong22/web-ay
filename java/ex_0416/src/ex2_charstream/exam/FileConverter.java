package ex2_charstream.exam;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileWriter;

public class FileConverter {

	public void copy(String source, String target) {

		FileInputStream in = null;
		FileOutputStream out = null;
		FileWriter fw = null;

		try {
			in = new FileInputStream(source);
			out = new FileOutputStream(target);

			byte[] buffer = new byte[1024];

			int readByte;
			long totalSize = 0;

			while((readByte = in.read(buffer)) != -1) {
				out.write(buffer, 0, readByte);
				totalSize += readByte;
			}

			fw = new FileWriter("log.txt", true);
			fw.write("복사된 파일: " + target + "\n");
			fw.write("파일 크기: " + totalSize + "byte\n");
			fw.write("----------------------\n");

			System.out.println("복사 완료!");

		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				if(in != null) in.close();
				if(out != null) out.close();
				if(fw != null) fw.close();
			} catch (Exception e) {}
		}
	}

	// ⭐ 여기 추가하면 끝
	public static void main(String[] args) {
		FileConverter fc = new FileConverter();
		fc.copy("wall.jpg", "wall_copy.jpg");
	}
}