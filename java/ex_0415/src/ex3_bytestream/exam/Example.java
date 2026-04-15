package ex3_bytestream.exam;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.io.IOException;

public class Example {
    public static void main(String[] args) {

        StringBuilder sb = new StringBuilder();

        // 1. 파일 읽기 (UTF-8 적용 ⭐핵심)
        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(
                        new FileInputStream("C:\\Users\\adminn\\Desktop\\web-ay\\java\\ex_0415\\src\\ex3_bytestream\\exam\\file.txt"),
                        "UTF-8"))) {

            String line;
            while ((line = br.readLine()) != null) {
                sb.append(line);
            }

        } catch (IOException e) {
            e.printStackTrace();
        }

        String original = sb.toString().trim();

        // 2. 뒤집기
        String reversed = new StringBuilder(original).reverse().toString();

        // 3. 회문 판별
        if (original.equals(reversed)) {
            System.out.println("회문입니다.");
        } else {
            System.out.println("회문이 아닙니다.");
        }

        // 출력 확인
        System.out.println("원본: " + original);
        System.out.println("뒤집기: " + reversed);
    }
}