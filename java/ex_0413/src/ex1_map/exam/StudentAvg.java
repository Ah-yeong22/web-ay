package ex1_map.exam;

import java.util.HashMap;
import java.util.Map;

public class StudentAvg {
	public static void main(String[] args) {
		//이름을 key 점수를 value로 저장
		Map<String, Integer> map = new HashMap<>();
		
		map.put("홍길동", 70);
		map.put("박길동", 75);
		map.put("김길동", 81);
		//평균, 최고점 학생을 찾는다
		int sum = 0;
		int maxScore = -1;
		String topStudent = "";
		
		for(Map.Entry<String, Integer> entry : map.entrySet()) {
			int score = entry.getValue();
			sum += score;
			
			if(score > maxScore) {
				maxScore = score;
				topStudent = entry.getKey();
			}
		}
		double avg = (double) sum / map.size();
		
		System.out.println("평균 : " +avg);
		System.out.println("최고 점수 학생  : " +topStudent+"/"+maxScore);
	
		//평균점수 : xx점
		//최고 점수 학생 : xxx/00점 
	}
}
