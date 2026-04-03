package ex1_exception;

//NullpointerException: 참조변수가 null인 상태에서 필드나 메서드에 접근할 경우 
public class ExceptionHandlingExample1 {
	//문자열 데이터를 전달받아서 문자열의 길이가 얼만지 출력하느 메서드 작성하기
	public static void printLength(String str) {
		try {
			System.out.println(str.length());
			//예외가 발생하면 발생한 예외클래스의 객체가 만들어지게 된다.
			//catch의 매개변수로 들어온다.
		} catch(NullPointerException e) {
			System.out.println(e.getMessage());
//			System.out.println(e.toString());//e.getMessage() 예외가 발생한 이유만 반환
//			System.out.println(e.toString()); //e.toString() 예외의 종류도 반환
//			e.printStackTrace();//예외가 어디서 발생했는지 추적한 내용까지 출력해준다.
			System.out.println("에러가 발생했습니다. ");
		}finally {
			System.out.println("무조건 실행됨");
		}
		
		
	}
	public static void main(String[] args) {
		System.out.println("프로그램 시작");
		printLength("JAVA");
		printLength(null);
		System.out.println("프로그램 종료");
}

	
}
