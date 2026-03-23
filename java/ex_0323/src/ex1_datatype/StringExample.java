package ex1_datatype;

public class StringExample {
	public static void main(String[] args) {
	
		String s1 = "홍길동";
		System.out.println(s1);
		
		//데이터를 변수에 넣어서 사용하는 이유: 데이터를 저장해두고,재사용하기 위함 
		//이스케이프 문자
		//문자열 안에서 특수한 기능을 수행하기 위한 문자
		System.out.println("안녕하세요\"홍길동\"입니다.");
		// \" : 큰 따옴표 출력
		// \' : 작은 따옴표 출력
		// \\ : 백슬래시 출력
		System.out.println("hello\nworld");
		// \n : 줄바꿈
		System.out.println("hello\tworld");
		// \t : 탭 1개만큼 들여쓰기
		
		//텍스트 블록 적용가능(작성된 그대로의 문자열 저장) """ """
		String str = """ 
				영역 사이에 
				작성 함
				""";
		System.out.println(str);
}
}
