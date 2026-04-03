package ex1_exception.throwsexample;

public class ThrowsExample2 {
		//main 메서드에서도 throws 키워드를 사용해서 예외를 떠넘길 수 있다.
		//결국 JVM이 최종적으로 예외 처리를 하게 된다. 
		//JVM은 예외의 내용을 콘솔에 출력하는것으로 예외처리를 한다. 
		public static void main(String[] args) throws Exception {
				findClass();
				
		}
		
		public static void findClass() throws ClassNotFoundException{
			Class.forName("java.lang.String2");
	}

}
