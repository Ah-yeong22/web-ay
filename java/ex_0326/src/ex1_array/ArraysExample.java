package ex1_array;

import java.util.Arrays;
import java.util.Comparator;

public class ArraysExample {
	public static void main(String[] args) {
		//배열의 출력
		//toString()
		//반복문의 도움없이 배열의 요소를 출력할 수 있도록 도와줌
		//배열에 들어있는 모든 요소를 하나의 문자열로 묶어서 출력해줌
		
		int[]arr= {1,6,3,10,4,7,5,2,9,8};
		
		System.out.println(Arrays.toString(arr));
		
		System.out.println(Arrays.toString(arr));
		
		Arrays.sort(arr);
		System.out.println(Arrays.toString(arr));
		
		//내림차순 정렬
		//comparator.reverseOrder();
		//기본자료형 배열은 내림차림 할 수 없다.
		//기본타입의 클래스형이 Wrapper클래스가 잇다.
		
		Integer[] arr2 ={1,6,3,10,4,7,5,2,9,8};
		
		Arrays.sort(arr2, Comparator.reverseOrder());
		System.out.println(Arrays.toString(arr2));
		
		//배열이 같은지 비교
		//equals()
		
		//배열의 복사
		//배열은 한번 생성하면 길이를 변경할 수 없다.
		//더 많은 데이터를 저장하거나 똑같은 배열을 새로 만드려면 배열을 복사해야 함
		
		int[] arr01 = {1,2,3};
		
		//1. 얕은복사(Shallow copy)
		//복사된 배열이나 원본 배열이 변경될 때 서로 간의 값이 같이 변경된다.
		int[] arr02 = arr01;
		
		arr02[1] = 100;
		System.out.println(arr01[1]);
		
		//2. 깊은 복사(Deep Copy)
		//복사된 배열이나 원본 배열이 변경될 때 서로 간의 값은 바뀌지 않는다.'
		
		int [] cards = {1,6,4,5,3,2};
		
		int[] newCards = new int[cards.length];
		//반복문을 이용한 깊은 복사
		for(int i=0; i <cards.length; i++) {
			newCards[i] = cards[i];
		}
		int[] newCards2 = Arrays.copyOf(cards, cards.length);
		
		newCards[1] = 100;
		
		System.out.println("cards 배열" + Arrays.toString(cards));
		System.out.println("newCards 배열" + Arrays.toString(newCards));
		System.out.println("newCards2 배열" + Arrays.toString(newCards2));
	}
}
