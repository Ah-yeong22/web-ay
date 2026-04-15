package ex3_bytestream.exam;

import java.io.File;
import java.io.FileInputStream;

public class LogExample {
    public static void main(String[] args) {

        // 파일 객체
        File f = new File("C:\\Users\\adminn\\Desktop\\web-ay\\logs\\error.log");

        byte[] read = new byte[(int) f.length()];
        String content = "";

        try {
            // ❗ 경로 수정 (| → \)
            FileInputStream fis = new FileInputStream(f);

            fis.read(read);

            // ❗ 인코딩 명시 (한글 깨짐 방지)
            content = new String(read, "UTF-8");

            int count = 0;
            int index = 0;

            while ((index = content.indexOf("ERROR", index)) != -1) {
                count++;
                index += "ERROR".length();
            }

            System.out.println("ERROR의 개수: " + count);

            fis.close();

        } catch (Exception e) {
            e.printStackTrace(); // ❗ 예외 출력은 꼭 해라
        }
    }
}