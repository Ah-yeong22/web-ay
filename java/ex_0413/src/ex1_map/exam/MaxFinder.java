package ex1_map.exam;

import java.util.HashMap;
import java.util.Map;

public class MaxFinder {
	public static void main(String[] args) {
		int [] arr = {1,3,2,3,4,3,2,2,2};
		
		//숫자별 등장 횟수를 HashMap<Integer,Integer>로 센다. 
		//가장 큰 빈도수를 가진 숫자를 찾는다
		
		Map<Integer, Integer> map = new HashMap<Integer, Integer>();
		
		for(int num : arr) {
			map.put(num, map.getOrDefault(num, 0)+1);
		}
		
		int maxCount = 0;
		int maxNumber = 0;
		
		for(int key : map.keySet()) {
			int count = map.get(key);
			
			if(count > maxCount) {
				maxCount = count;
				maxNumber = key;
			}
		}
		System.out.println("가장 많이 나온 숫자 " + maxNumber);
		System.out.println("등장 횟수 :" +  maxCount);
		
	}
}
