package ex3_bufferedstream.exam;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.InputStreamReader;

public class SearchExample {
	public static void main(String[] args) {
		
		
		
		
		try {
			BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
			System.out.println("검색할 단어를 입력하세요 : ");
			String keyword = br.readLine();
			
			BufferedReader fileReader = new BufferedReader(new FileReader("story.txt"));
			
			String line;
			
			while((line = fileReader.readLine()) != null) {
				if(line.contains(keyword)){
					System.out.println(line);
				}
			}
			
		fileReader.close();
		
		}catch (Exception e) {
			// TODO: handle exception
		}
				
	}
}
