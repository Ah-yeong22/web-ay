package ex2_datatype;

public class Ex2_ByteExample {
	public static void main(String[] args) {
		//정수의 경우 해당 자료형이 표현할 수 있는 범위를 벗어난 데이터를 저장하면 오버를로우,언더플로우 발생 가능
		
		byte var1 = (byte) -129;
		System.out.println("var : " + var1);
		byte var2 = 127;
		//byte var3 = 128; //범위를 벗어나서 오류
	
	}

}
