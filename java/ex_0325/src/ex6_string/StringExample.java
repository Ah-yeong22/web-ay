package ex6_string;

import java.util.Arrays;
import java.util.Scanner;

public class StringExample {
	public static void main(String[] args) {
		//String : 문자들의 집합을 저장하는 객체 타입
		//묵시적 객체 생성
		//같은 문자열이면 객체를 공유
		String s1 = "홍길동";
		String s2 = "홍길동";
		
		if(s1 == s2) {
			System.out.println("s1과 s2의 주소가 같습니다.");
		}
		
		//명시적 객체 생성(new 통해 생성하는 객체)
		//항상 새로운 객체가 만들어짐
		String s3 = new String("홍길동");
		String s4 = new String("홍길동");
		
		if(s3==s4) {
			System.out.println("같암욤");
		}else
			System.out.println("달라염");
		
		//String은 클래스
		//클래스 안에는 자주 사용하는 기능들이 메서드 형태로 정의되어 있음
		
		//문자열에서 문자 추출하기
		//charAt(index);
		//index: 컴퓨터가 숫자를 세는 방식(0부터 순차적으로 센다)
		String subject = "자바 프로그래밍";
		char charValue = subject.charAt(3);
		System.out.println(charValue);
		
		String ssn = "9201231230123";
		char gender = ssn.charAt(6);
		String result = switch(gender) {
		case '1','3' -> "남자";
		case '2','4' -> "여자";
		default ->"잘못입력하셨습니다.";
		
		};System.out.println(result);
		
		//문자열의 길이 측정
		int length = subject.length();
		System.out.println("문자열의 길이 : " + length);
		
		//특정 문자열을 대체
		String newStr = subject.replace("자바","java");
		System.out.println(newStr);
		
		//문자열 잘라내기 substring(시작 index,끝 index);
		String str ="동해물과 백두산이 마르고 닳도록";
		System.out.println(str.substring(2,9));
		
		//위치 찾기
		//indexOf("문자열");
		int index = subject.indexOf("프로그래밍");
		System.out.println(index);
		
		index = subject.indexOf("안녕하세요");
		System.out.println(index);
		
		//문자열을 분리 
		//split("기준값");
		String board ="번호, 제목, 내용, 성명";
		String[] arr=board.split(",");
		System.out.println(Arrays.toString(arr));
		
		Scanner sc = new Scanner(System.in);
		System.out.println("알파벳을 입력하세요: ");
		String a = sc.next();
		
		int count = 0;
		
		for(int i = 0; i <a.length(); i++) {
			if(a.charAt(i) == 'a') {
				count++;
			}
		}//for
		
		System.out.println("a의 개수 :" + count);
	}
}
