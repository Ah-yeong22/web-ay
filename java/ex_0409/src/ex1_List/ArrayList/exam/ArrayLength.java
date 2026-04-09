package ex1_List.ArrayList.exam;

import java.util.ArrayList;
import java.util.List;

public class ArrayLength {
	public static void main(String[] args) {
		//문자열 타입 리스트 객체를 만든다. 
		List<String> list = new ArrayList<String>();
		
		//리스트에 "java" "spring" "html""css"저장
		list.add("java");
		list.add("Spring");
		list.add("HTML");
		list.add("CSS");
		
		//각 문자열의 길이를 계산하여 lengths라는 새로운 리스트 만들어서 저장
		List<Integer> lengths = new ArrayList<Integer>();
		for(String s : list) {
			lengths.add(s.length());
		}
		
		//문자열 형태의 리스트 생성
		List<String> list2 = new ArrayList<String>();
		//김철수 이영희 김철수 박민수 김철수
		list2.add("김철수");
		list2.add("이영희");
		list2.add("김철수");
		list2.add("박민수");
		list2.add("김철수");
		//김철수 몇번 들어갔는지 계산하여 출력 
		int count = 0;
		for(String s2 : list2) {
			if(s2.equals("김철수")) {
				count ++;
			}
		}
		//lengths 리스트 출력 
		System.out.println(lengths);
		System.out.println(count);
		
		List<Integer> list3 = new ArrayList<Integer>();
		list3.add(88);
		list3.add(72);
		list3.add(95);
		list3.add(81);
		list3.add(60);
		
		int max = list3.get(0);
		int min =list3.get(0);
		
		for(int num : list3) {
			if(num > max) {
				max=num;
			}if(num < min){
				min=num;
			}
		}
		int diff = max - min;
		System.out.println(max);
		System.out.println(min);
		System.out.println(diff);
	}
}
