#include <iostream>
#include <string>

int main(int argc, char **argv)
{
  int a, b;
  while (std::cin >> a >> b)
  {
    if (a == 0 && b == 0)
      break;

    std::cout << a / b << " " << a % b << " / " << b << std::endl;
  }
  return 0;
}