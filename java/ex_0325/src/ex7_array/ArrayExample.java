package ex7_array;

public class ArrayExample {
	public static void main(String[] args) {
		//{1,2,3,4,5}; -> 초기화 리스트
		//배열을 선언함과 동시에 초기화 리스트를 사용하는것이 가능
		int[] arr = {1,2,3,4,5};
		
		//new 연산자를 통한 배열의 생성
		//값이 들어있지는 않지만 후에 값을 저장할 목적으로 배열을 미리 생성 가능 
		int[] ar = new int[5];//공간이 5개 int 크기만큼
		
		//new 연산자로 배열을 처음 생성하면 배열 항목은 기본값으로 초기화됨
		//정수형 : 0
		//실수형 : 0.0
		//문자형 :''
		//참조형 : null
		
		ar[0] = 100;
		ar[1] = 200;
		ar[2] = 300;
		ar[3] = 400;
		ar[4] = 500;
		
		System.out.println(ar[0]);
		System.out.println(ar[1]);
		System.out.println(ar[2]);
		System.out.println(ar[3]);
		System.out.println(ar[4]);
		
	}
}
