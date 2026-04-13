package ex1_map.exam;

import java.util.HashMap;
import java.util.Map;

public class WordCount {
	public static void main(String[] args) {
			//단어 빈도수 분석기
		//문자열을 공백을 기준으로 분리
		//모두 소문자로 바꿈
		//HashMap<String, Integer>에 단어별 개수를 저장한다. 
		//String text = "Apple banana apple Banana apple";
		
		String text = "Apple banana apple Banana apple";
		
		//소문자로 변환
		text = text.toLowerCase();
		
		//공백 기준 분리
		String[] words = text.split(" ");
		
		//map 생성
		Map<String, Integer> map = new HashMap<>();
		
		
		//단어 개수 세기
		for(String word : words) {
			if(map.containsKey(word)) {
				map.put(word, map.get(word) + 1);			
				}else {
				map.put(word, 1);
			}
		}
		for(String key : map.keySet()) {
			System.out.println(key + ":" + map.get(key));
		}
	}
}
