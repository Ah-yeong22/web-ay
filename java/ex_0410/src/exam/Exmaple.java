package exam;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Scanner;
import java.util.Set;

public class Exmaple {
	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		
		List<String> list = new ArrayList<>(); // ⭐ 이거 추가
		
		while(true) {
			System.out.print("문자열 입력(exit 입력시 종료) : ");
			String input = sc.next();
			
			if(input.equals("exit")) {
				break;
			}
			list.add(input);
		}
		
		Set<String> set = new HashSet<>(list);
		List<String> result = new ArrayList<>(set);

		Collections.sort(result);
		System.out.println("중복 제거 후 정렬 결과 : " + result);
		
		//학생 이름을 입력받아 List에 저장한다. 
		//이미 존재하는 이름이면 추가하지 않고 "이미 존재하는 이름입니다." 메세지 출력 
		
		List<String> name = new ArrayList<>();
		
		while(true) {
		    System.out.print("학생 이름 입력 (exit 입력 시 종료): ");
		    String s = sc.next();
		    
		    if(s.equals("exit")) {
		        break;
		    }
		    
		    if(name.contains(s)) {
		        System.out.println("이미 존재하는 이름입니다.");
		    } else {
		        name.add(s);
		        System.out.println("추가 완료");
		    }
		}

		// 반복문 끝난 후 출력
		Collections.sort(name);
		System.out.println("최종 학생 목록: " + name);
	}
}